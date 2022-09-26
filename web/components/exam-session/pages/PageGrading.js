import { useCallback, useEffect, useState, useRef } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { StudentQuestionGradingStatus } from '@prisma/client';
import Image from 'next/image';

import { Stack, Box, Divider, TextField, Paper, Button, Menu, MenuList, MenuItem } from "@mui/material";
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

    useEffect(() => {
        if(data){
            applyFilter(filter, [...data]);
        }
    }, [data]);

    const applyFilter = useCallback((filter, questions) => {
        console.log('applyFilter', filter);
        if(!filter){
            setQuestions(questions);
            return;
        }
        switch(filter){
            case 'graded':
                setQuestions(questions.filter(q => q.studentGrading.every(sg => sg.status === StudentQuestionGradingStatus.GRADED)));
                break;
            case 'unsigned':
                let unsignedQuestions = questions.filter(q => q.studentGrading.some(sg => !sg.signedBy));
                if(unsignedQuestions.length > 0){
                    setQuestions(unsignedQuestions);
                }else{
                    // TODO: Trigger grading end...
                    setQuestions(questions);
                }
                break;
            default:
                setQuestions(questions);
                break;
        }
    }, []);

    useEffect(() => {
        if (questions && questions.length > 0) {
            let activeQuestionId = router.query.activeQuestion;
            let activeQuestion = questions.find(q => q.id ===  activeQuestionId);
            if (parseInt(activeQuestionId) === 1 || !activeQuestion) {
                // redirect to first question and first participant
                let firstQuestion = questions[0];
                router.push(`/exam-sessions/${router.query.sessionId}/grading/${firstQuestion.id}?participantId=${firstQuestion.studentGrading[0].user.id}`);
                return;
            }
            
            setQuestion(activeQuestion);
            setParticipants(activeQuestion.studentGrading.map((sg) => sg.user));
        }
    }, [questions, router]);



    const onSignOff = useCallback((grading) => {
        const newQuestions = [...data];
        question.studentGrading = question.studentGrading.map((studentGrading) => {
            if (studentGrading.user.id === grading.user.id) {
                return {
                    ...studentGrading,
                    ...grading
                };
            }
            return studentGrading;
        });
        applyFilter(filter, newQuestions);
        mutate(newQuestions, false);
    }, [question, mutate, filter, data, applyFilter]);


    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    return (
        <>
           { questions && (
            <LayoutSplitScreen 
                header={<MainMenu />}
                subheader={
                    <Stack direction="row">
                        <Stack flex={1} sx={{ overflow:'hidden' }}>
                            <QuestionPages
                                questions={questions}
                                activeQuestion={question}
                                link={(questionId, _) => `/exam-sessions/${router.query.sessionId}/grading/${questionId}?participantId=${router.query.participantId}`}
                                isFilled={(questionId) => {
                                    const question = questions.find((q) => q.id === questionId);
                                    return question && question.studentGrading.every((studentGrading) => studentGrading.signedBy);
                                }}
                            />  
                        </Stack>
                        <GradingToolbar
                            onAction={(action) => {
                                if(action === 'sign-off-all-autograded'){
                                    const newQuestions = [...questions];
                                    for(const question of newQuestions){
                                        for(const studentGrading of question.studentGrading){
                                            if(!studentGrading.signedBy && studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED){
                                                studentGrading.signedBy = session.user;
                                            }
                                        }
                                    }
                                    setQuestions(newQuestions);
                                    mutate(newQuestions, false);
                                }
                            }}
                        />
                        <GradingFilters 
                            onFilter={(filter) => {
                                setFilter(filter);
                                applyFilter(filter, data);
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
                            <GradingSignOff
                                grading={question.studentGrading.find((grading) => grading.user.id === router.query.participantId)}
                                maxPoints={question.points}
                                onSignOff={onSignOff}
                                clickNextParticipant={(current) => {
                                    const next = participants.findIndex((studentGrading) => studentGrading.id === current.id) + 1;
                                    if (next < participants.length) {
                                        router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participants[next].id}`);
                                    }
                                    
                                }}
                            />
                            </>
                        )}
                    </Stack>
                }
            />  
           )}
        </>
        
    )
}

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const GradingFilters = ({ onFilter }) => {
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

const GradingToolbar = ({ onAction }) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <Stack direction="row" sx={{ ml:2 }}>
            <Button 
                ref={buttonRef}
                startIcon={
                    <Image 
                        src="/svg/grading/bulk-actions.svg"
                        alt="Filter inactive"
                        layout="fixed" width={18} height={18} 
                    />
                }
                endIcon={<ExpandMoreIcon />}
                onClick={() => setOpen(!open)}
            >
            Actions
            </Button>
           
            <Menu anchorEl={buttonRef.current} open={open} keepMounted onClose={() => setOpen(false)}>
                <MenuList onClick={() => setOpen(false)}>
                    <MenuItem onClick={() => onAction('sign-off-all-autograded')}>Sign off all autograded</MenuItem>
                    <MenuItem onClick={() => onAction('end-grading')}>End grading</MenuItem>
                </MenuList>
            </Menu>
        </Stack>
    )
}


    

export default PageGrading;