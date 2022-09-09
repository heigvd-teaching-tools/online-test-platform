import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { ExamSessionPhase } from '@prisma/client';

import { Stack, Box, Tabs, Tab } from "@mui/material";

import TakeExamSessionLayout from '../../../../components/layout/TakeExamSessionLayout';
import AlertFeedback from "../../../../components/feedback/AlertFeedback";
import LoadingAnimation from "../../../../components/layout/LoadingAnimation";
import StudentAnswer from "../../../../components/answer/StudentAnswer";
import { useSnackbar } from '../../../../context/SnackbarContext';

const TakeExam = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: sessionQuestions, errorQuestions } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-answers/student`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ page, setPage ] = useState(parseInt(router.query.pageId));
    const [ questions, setQuestions ] = useState(undefined);

    useEffect(() => setPage(parseInt(router.query.pageId)), [router.query.pageId]);

    useEffect(() => {
        if(sessionQuestions){
            setQuestions(sessionQuestions);
        }
    }, [sessionQuestions]);

    const onAnswer = useCallback((answer) => {
        (async () => {
            await fetch(`/api/exam-sessions/${router.query.sessionId}/questions/${questions[page - 1].id}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ answer: answer })
            })
            .then(_ => {
                questions[page - 1].studentAnswer = {
                    [questions[page - 1].type]: answer
                };
                if(answer === undefined){
                    delete questions[page - 1].studentAnswer;
                    showSnackbar('Your answer has been removed', 'success');
                }else{
                    showSnackbar('Answer submitted successfully', 'success');
                }
            }).catch(err => {
                showSnackbar('Error submitting answer', 'error');
            });
        })();
    }, [questions, page, router.query.sessionId, showSnackbar]);

    const hasAnswered = useCallback((page) => {
        let question = questions[page - 1];
        return question.studentAnswer && question.studentAnswer[question.type] !== undefined;
    }, [questions]);

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS) return <LoadingAnimation text={`${examSession.label} is not in progress.`} />;       
    
    return (
        <TakeExamSessionLayout appBarContent={
            <Stack direction="row" alignItems="center">
                {examSession.startAt && examSession.endAt && (
                    <Box sx={{ ml:2 }}>
                    <ExamSessionCountDown
                        startDate={examSession.startAt}
                        endDate={examSession.endAt}
                    />
                    </Box>
                )}
                {questions && questions.length > 0 && (
                    <QuestionPages 
                        count={questions.length} 
                        page={page} 
                        router={router} 
                        hasAnswered={hasAnswered} 
                    />
                )}
                
            </Stack>
        }>
        <Stack sx={{ minWidth:'100%', minHeight: '100%' }}>
            { questions && questions.length > 0 && (
                <>
                {questions[page - 1] && (
                    <StudentAnswer
                        question={questions[page - 1]}
                        totalPages={questions.length}
                        page={page} 
                        onAnswer={onAnswer}
                    />
                )}
            </>
            )}
        </Stack>    
        </TakeExamSessionLayout>        
    )
}

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExamSessionCountDown from '../../../../components/exam-session/in-progress/ExamSessionCountDown';

const QuestionPages = ({ count, page, hasAnswered }) => {
    const router = useRouter();
    return (
        <Tabs
            value={page - 1}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(e, page) => router.push(`/exam-sessions/${router.query.sessionId}/take/${page + 1}`)}
        >
            {Array.from(Array(count).keys()).map((_, index) => (
                <Tab
                    key={index}
                    label={`Q${index + 1}`}	
                    iconPosition="start"
                    sx={{ minHeight: '50px', minWidth: 0 }}
                    icon={hasAnswered(index + 1) ? <CheckIcon sx={{ color: '#2e7d32' }}/> : <CloseIcon sx={{ color: '#da291c' }} />}
                />
            ))}
        </Tabs>
    )
};

export default TakeExam;