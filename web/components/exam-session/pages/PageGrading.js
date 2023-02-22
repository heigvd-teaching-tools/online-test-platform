import { useCallback, useEffect, useState, useRef } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import {StudentQuestionGradingStatus, ExamSessionPhase, Role} from '@prisma/client';
import Image from 'next/image';

import { update } from './crud';

import { Stack, Divider, Paper, Button, Menu, MenuList, MenuItem, Typography, IconButton } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';

import QuestionPages from '../take/QuestionPages';
import MainMenu from '../../layout/MainMenu';
import QuestionView from '../../question/QuestionView';

import AnswerCompare from '../../answer/AnswerCompare';
import GradingSignOff from '../grading/GradingSignOff';
import ParticipantNav from '../grading/ParticipantNav';
import { useSession } from "next-auth/react";

import { useSnackbar } from "../../../context/SnackbarContext";

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Authorisation from "../../security/Authorisation";

const PageGrading = () => {
    const router = useRouter();
    const { data:session } = useSession();
    const { show: showSnackbar } = useSnackbar();

    const { data:examSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const { data, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-grading/official`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    const [ questions, setQuestions ] = useState([]);
    const [ participants, setParticipants ] = useState([]);

    const [ filter, setFilter ] = useState();
    const [ question, setQuestion ] = useState();

    const [ saving, setSaving ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    const [ autoGradeSignOffDialogOpen, setAutoGradeSignOffDialogOpen ] = useState(false);
    const [ endGradingDialogOpen, setEndGradingDialogOpen ] = useState(false);
    const [ someUnsignedDialogOpen, setSomeUnsignedDialogOpen ] = useState(false);

    useEffect(() => {
        if(data){
            setQuestions(data)
        }
    }, [data]);

    const applyFilter = useCallback((questions) => {
        switch(filter){
            case 'unsigned':
                let questionToDisplay = questions.filter(q => q.studentAnswer.some(sg => !sg.studentGrading.signedBy));
                if(questionToDisplay.length > 0 && questionToDisplay.findIndex(q => q.id === question?.id) === -1){
                    // active questions is not in the filtered list -> jump to first
                    router.push(`/exam-sessions/${router.query.sessionId}/grading/${questionToDisplay[0].id}?participantId=${questionToDisplay[0].studentGrading[0].user.id}`);
                }
                return questionToDisplay;
            default:
                return questions;
        }
    }, [filter, question, router]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            let activeQuestionId = router.query.activeQuestion;
            let activeQuestion = applyFilter(questions).find(q => q.id === activeQuestionId);
            if (parseInt(activeQuestionId) === 1 || !activeQuestion) {
                // redirect to first questions and first participant
                let firstQuestion = questions[0];
                router.push(`/exam-sessions/${router.query.sessionId}/grading/${firstQuestion.id}?participantId=${firstQuestion.studentAnswer[0].user.id}`);
                return;
            }

            setQuestion(activeQuestion);
            setParticipants(activeQuestion.studentAnswer.map((sg) => sg.user).sort((a, b) => a.name.localeCompare(b.name)));
        }
    }, [questions, router, applyFilter]);

    const saveGrading = async (grading) => {
        setLoading(true);
        let newGrading = await fetch(`/api/gradings`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grading
            })
        }).then((res) => res.json());
        setLoading(false);
        return newGrading;
    };

    const onSignOff = useCallback(async (grading) => {
        const newQuestions = [...questions];
        let newGrading = grading;
        question.studentAnswer = question.studentAnswer.map((sa) => {
            if (sa.user.email === grading.userEmail) {
                return {
                    ...sa,
                    studentGrading: {
                        ...sa.studentGrading,
                        ...grading
                    }
                };
            }
            return sa;
        });
        await saveGrading(newGrading);
        setQuestions(newQuestions);
        await mutate(newQuestions, false);
    }, [questions, question, mutate]);

    const signOffAllAutograded = useCallback(async () => {
        let updated = [];
        const newQuestions = [...questions];
        for(const question of newQuestions){
            for(const { studentGrading } of question.studentAnswer){
                if(!studentGrading.signedBy && studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED){
                    studentGrading.signedBy = session.user;
                    updated.push(studentGrading);
                }
            }
        }
        await Promise.all(updated.map(grading => saveGrading(grading)));
        setQuestions(newQuestions);
        await mutate(newQuestions, false);
    }, [questions, mutate, session]);

    const endGrading = useCallback(async () => {
        setSaving(true);
        await update(router.query.sessionId, {
            phase: ExamSessionPhase.FINISHED
        }).then(() => {
            router.push(`/exam-sessions/${router.query.sessionId}/finished`);
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
        setSaving(false);
    }, [router]);

    const nextParticipantOrQuestion = useCallback(() => {
        let nextParticipantIndex = participants.findIndex((p) => p.id === router.query.participantId) + 1;
        if (nextParticipantIndex < participants.length) {
            router.push(`/exam-sessions/${router.query.sessionId}/grading/${question.id}?participantId=${participants[nextParticipantIndex].id}`);
        } else {
            let nextQuestionIndex = applyFilter(questions).findIndex((q) => q.id === question.id) + 1;
            if (nextQuestionIndex < questions.length) {
                router.push(`/exam-sessions/${router.query.sessionId}/grading/${questions[nextQuestionIndex].id}?participantId=${participants[0].id}`);
            } else {
                // count signed gradings vs total gradings
                let stats = getGradingStats(questions);
                if(stats.totalSigned === stats.totalGradings){
                    setEndGradingDialogOpen(true);
                } else {
                    setSomeUnsignedDialogOpen(true);
                }

            }
        }
    }, [participants, router, question, questions, applyFilter]);

    const prevParticipantOrQuestion = useCallback(() => {
        let prevParticipantIndex = participants.findIndex((p) => p.id === router.query.participantId) - 1;
        if (prevParticipantIndex >= 0) {
            router.push(`/exam-sessions/${router.query.sessionId}/grading/${question.id}?participantId=${participants[prevParticipantIndex].id}`);
        } else {
            let prevQuestionIndex = applyFilter(questions).findIndex((q) => q.id === question.id) - 1;
            if (prevQuestionIndex >= 0) {
                router.push(`/exam-sessions/${router.query.sessionId}/grading/${questions[prevQuestionIndex].id}?participantId=${participants[participants.length - 1].id}`);
            }
        }
    }, [participants, router, question, questions, applyFilter]);


    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={examSession?.phase}>
           { questions && (
               <LayoutMain
                   header={ <MainMenu /> }
                   subheader={
                       <Stack direction="row" alignItems="center">
                           <Stack flex={1} sx={{ overflow:'hidden' }}>
                               <QuestionPages
                                   questions={applyFilter(questions)}
                                   activeQuestion={question}
                                   link={(questionId, _) => `/exam-sessions/${router.query.sessionId}/grading/${questionId}?participantId=${router.query.participantId}`}
                                   isFilled={(questionId) => {
                                       const question = questions.find((q) => q.id === questionId);
                                       return question && question.studentAnswer.every((sa) => sa.studentGrading.signedBy);
                                   }}
                               />
                           </Stack>
                           <GradingQuestionFilter
                               onFilter={(filter) => {
                                   setFilter(filter);
                               }}
                           />
                       </Stack>
                   }
                   padding={0}
                   spacing={2}
               >
                <LayoutSplitScreen
                    header={<MainMenu />}
                    leftPanel={
                        <Stack direction="row" sx={{ position:'relative', height:'100%' }}>
                            { question && (
                                <QuestionView
                                    question={question}
                                    totalPages={questions.length}
                                />
                            )}
                        </Stack>
                    }
                    rightWidth={75}
                    rightPanel={
                        <Stack direction="row" sx={{ position:'relative', height:'100%', overflowX:'auto' }}>
                            { question && participants && participants.length > 0 && (
                                <>
                                <ParticipantNav
                                    participants={participants}
                                    active={participants.find((participant) => participant.id === router.query.participantId)}
                                    onParticipantClick={(participant) => {
                                        router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participant.id}`);
                                    }}
                                    isParticipantFilled={(participant) => {
                                        const grading = question && question.studentAnswer.find((sa) => sa.user.id === participant.id).studentGrading;
                                        return grading && grading.signedBy;
                                    }}
                                />
                                <Divider orientation="vertical" light flexItem />
                                </>
                            )}

                            { question && (
                                <ResizeObserverProvider>
                                    <AnswerCompare
                                        id={`question-grading-${question.id}`}
                                        mode="compare"
                                        questionType={question.type}
                                        solution={question[question.type]}
                                        answer={question.studentAnswer.find((answer) => answer.user.id === router.query.participantId)[question.type]}
                                    />
                                </ResizeObserverProvider>
                            )}
                        </Stack>
                    }
                    footerHeight={100}
                    footer={
                        question && (
                            <Stack direction="row" justifyContent="space-between" sx={{ height:'100%' }} >
                                <GradingNextBack
                                    isFirst={participants.findIndex((p) => p.id === router.query.participantId) === 0 && applyFilter(questions).findIndex((q) => q.id === question.id) === 0}
                                    onPrev={prevParticipantOrQuestion}
                                    onNext={nextParticipantOrQuestion}
                                />
                                <GradingSignOff
                                    loading={loading}
                                    grading={question.studentAnswer.find((ans) => ans.user.id === router.query.participantId).studentGrading}
                                    maxPoints={question.points}
                                    onSignOff={onSignOff}
                                    clickNextParticipant={(current) => {
                                        const next = participants.findIndex((studentGrading) => studentGrading.id === current.id) + 1;
                                        if (next < participants.length) {
                                            router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participants[next].id}`);
                                        }
                                    }}
                                />
                                <SuccessRate
                                    value={getSignedSuccessRate(questions)}
                                />
                                <GradingActions
                                    stats={getGradingStats(questions)}
                                    loading={loading || saving}
                                    signOffAllAutograded={() => setAutoGradeSignOffDialogOpen(true)}
                                    endGrading={() => setEndGradingDialogOpen(true)}
                                />
                            </Stack>
                        )
                    }
                />
            </LayoutMain>
           )}
           <DialogFeedback
                open={autoGradeSignOffDialogOpen}
                onClose={() => setAutoGradeSignOffDialogOpen(false)}
                title="Sign off all autograded"
                content={
                    <>
                        <Typography variant="body1" sx={{ mb:2 }}>
                            Its is recommended to control the autograded answers before signing them off.
                        </Typography>
                        <Typography variant="button" gutterBottom>
                            Are you sure you want to sign off all autograded answers?
                        </Typography>
                    </>
                }
                onConfirm={signOffAllAutograded}
            />
            <DialogFeedback
                open={endGradingDialogOpen}
                onClose={() => setEndGradingDialogOpen(false)}
                title="End grading"
                content={
                    <>
                        <Typography variant="body1" sx={{ mb:2 }}>
                            You wont be able to get back to the grading phase.
                        </Typography>
                        <Typography variant="button" gutterBottom>
                            Are you sure you want to end grading?
                        </Typography>
                    </>
                }
                onConfirm={endGrading}
            />
            <DialogFeedback
                open={someUnsignedDialogOpen}
                onClose={() => setSomeUnsignedDialogOpen(false)}
                title="End grading"
                content={
                    <Typography variant="body1" sx={{ mb:2 }}>
                        The signoff process is not complete.
                    </Typography>
                }
            />

        </PhaseRedirect>
        </Authorisation>
    )
}

const GradingNextBack = ({ isFirst, onPrev, onNext }) => {
    return(
        <Paper>
            <Stack direction="row" justifyContent="space-between" >
                <IconButton onClick={onPrev} disabled={isFirst}
                    sx={{ width: 90, height: 90, borderRadius: 0, borderRight: 0 }}
                >
                    <ArrowBackIosIcon />
                </IconButton>
                <IconButton onClick={onNext}
                    sx={{ width: 90, height: 90, borderRadius: 0, borderRight: 0 }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
                </Stack>
        </Paper>
    )
}

const SuccessRate = ({ value }) => {
    return (
        <Paper sx={{ p:1 }}>
            <Stack alignItems="center" justifyContent="center" spacing={1}>
                <Typography variant="body2" sx={{ mr:1 }}>Success Rate</Typography>
                <PiePercent value={value} />
            </Stack>
        </Paper>
    )
}

const GradingActions = ({ stats: { totalSigned, totalGradings, totalAutogradedUnsigned }, loading, signOffAllAutograded, endGrading }) =>
<Paper sx={{ p:1 }}>
    <Stack justifyContent="center" spacing={1} sx={{ height:"100%" }}>
        <Stack flexGrow={1} alignItems="start" justifyContent="space-between" direction="row">
            <Stack direction="row" alignItems="center" sx={{ mr:2 }}>
                <Typography variant="body2" sx={{ mr:1 }}>Grading progress:</Typography>
                <Typography variant="body2" sx={{ fontWeight:'bold' }}>{totalSigned} / {totalGradings}</Typography>
            </Stack>
            { totalSigned < totalGradings && (
                <PiePercent size={39} value={Math.round((totalSigned / totalGradings) * 100)} />
            )}
        </Stack>
        { totalSigned === totalGradings && (
            <Button color="success" fullWidth variant="contained" size="small" onClick={endGrading}>End grading</Button>
        )}
        { totalAutogradedUnsigned > 0 && (
            <LoadingButton loading={loading} size="small" onClick={signOffAllAutograded}>Sign off {totalAutogradedUnsigned} autograded unsigned</LoadingButton>
        )}
    </Stack>
</Paper>

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DialogFeedback from '../../feedback/DialogFeedback';
import PiePercent from '../../feedback/PiePercent';
import PhaseRedirect from './PhaseRedirect';
import {getGradingStats, getSignedSuccessRate} from "./stats";
import LayoutMain from "../../layout/LayoutMain";
import {ResizeObserverProvider} from "../../../context/ResizeObserverContext";

const GradingQuestionFilter = ({ onFilter }) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const [filter, setFilter] = useState(undefined);

    useEffect(() => {
        onFilter(filter);
    }, [filter]);

    return (
        <Stack direction="row" sx={{ ml:2 }}>
            <Button
                ref={buttonRef}
                color="info"
                startIcon={
                    <Image
                        src="/svg/grading/filter-inactive.svg"
                        alt="Filter inactive"
                        layout="fixed" width={18} height={18}
                    />
                }
                endIcon={<ExpandMoreIcon />}
                onClick={() => setOpen(!open)}
            >{filter ? filter : 'none' }</Button>
            <Menu anchorEl={buttonRef.current} open={open} keepMounted onClose={() => setOpen(false)}>
                <MenuList onClick={() => setOpen(false)}>
                    <MenuItem onClick={() => setFilter(undefined)}>None</MenuItem>
                    <MenuItem onClick={() => setFilter('unsigned')}>Unsigned</MenuItem>
                </MenuList>
            </Menu>
        </Stack>
    )
}


export default PageGrading;
