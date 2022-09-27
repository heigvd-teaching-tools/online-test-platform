import { useCallback, useEffect, useState, useRef } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { StudentQuestionGradingStatus } from '@prisma/client';
import Image from 'next/image';

import { Stack, Box, Divider, TextField, Paper, Button, Menu, MenuList, MenuItem, Typography, CircularProgress } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";

import { useSnackbar } from '../../../context/SnackbarContext';

import { useDebouncedCallback } from 'use-debounce';
import QuestionPages from '../take/QuestionPages';
import MainMenu from '../../layout/MainMenu';
import QuestionView from '../take/QuestionView';

import AnswerCompare from '../../answer/AnswerCompare';
import GradingSignOff from '../grading/GradingSignOff';
import ParticipantNav from '../grading/ParticipantNav';
import { useSession } from "next-auth/react";

const PageGrading = () => {
    const router = useRouter();
    const { data:session } = useSession();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
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

    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if(data){
            setQuestions(data)
        }
    }, [data]);

    const applyFilter = useCallback((questions) => {
        switch(filter){
            case 'unsigned':
                let questionToDisplay = questions.filter(q => q.studentGrading.some(sg => !sg.signedBy));
                if(questionToDisplay.length > 0 && questionToDisplay.findIndex(q => q.id === question?.id) === -1){
                    // active question is not in the filtered list -> jump to first
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
            let activeQuestion = applyFilter(questions).find(q => q.id ===  activeQuestionId);
            if (parseInt(activeQuestionId) === 1 || !activeQuestion) {
                // redirect to first question and first participant
                let firstQuestion = questions[0];
                router.push(`/exam-sessions/${router.query.sessionId}/grading/${firstQuestion.id}?participantId=${firstQuestion.studentGrading[0].user.id}`);
                return;
            }
            
            setQuestion(activeQuestion);
            setParticipants(activeQuestion.studentGrading.map((sg) => sg.user).sort((a, b) => a.name.localeCompare(b.name)));
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
        question.studentGrading = question.studentGrading.map((studentGrading) => {
            if (studentGrading.user.id === grading.user.id) {
                newGrading = { ...studentGrading,  ...newGrading }
                return newGrading;
            }
            return studentGrading;
        });
        await saveGrading(newGrading);
        setQuestions(newQuestions);
        mutate(newQuestions, false);
    }, [questions, question, mutate]);

    const signOffAllAutograded = useCallback(async () => {
        let updated = [];
        const newQuestions = [...questions];
        for(const question of newQuestions){
            for(const studentGrading of question.studentGrading){
                if(!studentGrading.signedBy && studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED){
                    studentGrading.signedBy = session.user;
                    updated.push(studentGrading);
                }
            }
        }
        await Promise.all(updated.map(grading => saveGrading(grading)));
        setQuestions(newQuestions);
        mutate(newQuestions, false);
    }, [questions, mutate, session]);

    const getSuccessRate = () => {
        // total signed points
        let totalSignedPoints = questions.reduce((acc, question) => {
            let signedGradings = question.studentGrading.filter((studentGrading) => studentGrading.signedBy).length;
            return acc + signedGradings * question.points;
        }, 0);
        // total signed obtained points
        let totalSignedObtainedPoints = questions.reduce((acc, question) => acc + question.studentGrading.filter((studentGrading) => studentGrading.signedBy).reduce((acc, studentGrading) => acc + studentGrading.pointsObtained, 0), 0);
        return totalSignedPoints > 0 ? Math.round(totalSignedObtainedPoints / totalSignedPoints * 100) : 0;
    }

   
    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    return (
        <>
           { questions && (
            <LayoutSplitScreen 
                header={<MainMenu />}
                subheader={
                    <Stack direction="row" alignItems="center">
                        <Stack flex={1} sx={{ overflow:'hidden' }}>
                            <QuestionPages
                                questions={applyFilter(questions)}
                                activeQuestion={question}
                                link={(questionId, _) => `/exam-sessions/${router.query.sessionId}/grading/${questionId}?participantId=${router.query.participantId}`}
                                isFilled={(questionId) => {
                                    const question = questions.find((q) => q.id === questionId);
                                    return question && question.studentGrading.every((studentGrading) => studentGrading.signedBy);
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
                    <Stack direction="row" sx={{ position:'relative', height:'100%', overflowX:'auto', pb:12 }}>
                        { question && participants && participants.length > 0 && (
                            <>
                            <ParticipantNav 
                                participants={participants} 
                                active={participants.find((participant) => participant.id === router.query.participantId)}
                                onParticipantClick={(participant) => {
                                    router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participant.id}`);
                                }}
                                isParticipantFilled={(participant) => {
                                    const grading = question && question.studentGrading.find((studentGrading) => studentGrading.user.id === participant.id);
                                    return grading && grading.signedBy;
                                }}
                            />    
                            <Divider orientation="vertical" light flexItem />  
                            </>
                        )}
                        
                        { question && (   
                            <>
                            <AnswerCompare
                                question={question}
                                answer={question.studentAnswer.find((answer) => answer.user.id === router.query.participantId)}
                            />
                            <Stack direction="row" justifyContent="space-between" sx={{ position:'absolute', bottom:0, left:0, right:0, height: 90 }}>
                                
                                <GradingSignOff
                                    loading={loading}
                                    grading={question.studentGrading.find((grading) => {
                                        console.log("grading", grading);
                                        return grading.user.id === router.query.participantId;
                                    })}
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
                                    value={getSuccessRate()} 
                                />
                                <GradingActions
                                    questions={questions}
                                    loading={loading}
                                    signOffAllAutograded={signOffAllAutograded}
                                />
                            </Stack>
                            </>
                        )}
                    </Stack>
                }
            />  
           )}
        </>
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

const PiePercent = ({ value, size = 45 }) => {
    const color = value > 70 ? 'success' : value > 40 ? 'info' : 'error';
    return (
        <Box sx={{ position:'relative', display:'inline-flex' }}>
            <CircularProgress
                size={size}
                variant="determinate"
                value={value}
                sx={{ color: (theme) => theme.palette[color].main }}
            />
            <Typography variant="caption" sx={{ position:'absolute', top:0, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {value}%
            </Typography>
        </Box>
    )
}

const GradingActions = ({ questions, loading, signOffAllAutograded }) => {
    let totalGradings = questions.reduce((acc, question) => acc + question.studentGrading.length, 0);
    let totalSigned = questions.reduce((acc, question) => acc + question.studentGrading.filter((studentGrading) => studentGrading.signedBy).length, 0);
    let totalAutogradedUnsigned = questions.reduce((acc, question) => acc + question.studentGrading.filter((studentGrading) => studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED && !studentGrading.signedBy).length, 0);

    return(
        <Paper sx={{ p:1 }}>
            <Stack justifyContent="center" spacing={1} sx={{ height:"100%" }}>
                <Stack flexGrow={1} alignItems="start" justifyContent="space-between" direction="row">
                    <Stack direction="row" alignItems="center" sx={{ mr:2 }}>
                        <Typography variant="body2" sx={{ mr:1 }}>Signed:</Typography>
                        <Typography variant="body2" sx={{ fontWeight:'bold' }}>{totalSigned} / {totalGradings}</Typography>
                    </Stack>    
                    {totalSigned < totalGradings && (
                        <PiePercent size={39} value={Math.round((totalSigned / totalGradings) * 100)} />
                    )}                
                </Stack>
                
                {
                    totalSigned === totalGradings && (
                        <Button color="success" fullWidth variant="contained" size="small" onClick={() => {} }>End grading</Button>
                    )
                }
                
                { 
                    totalAutogradedUnsigned > 0 && (
                        <LoadingButton loading={loading} size="small" onClick={signOffAllAutograded}>Sign off {totalAutogradedUnsigned} autograded unsigned</LoadingButton>
                    )
                }
        </Stack>
    </Paper>
    )
}

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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