import { useEffect, useState, useCallback } from 'react';
import useSWR, { SWRConfig  } from "swr";
import { useRouter } from "next/router";
import { ExamSessionPhase } from '@prisma/client';

import { Stack, Box } from "@mui/material";

import LayoutFullScreen from '../../layout/LayoutFullScreen';
import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";
import StudentAnswer from "../take/answer/StudentAnswer"; 
import QuestionPages from '../take/QuestionPages';
import { useSnackbar } from '../../../context/SnackbarContext';
import ExamSessionCountDown from '../in-progress/ExamSessionCountDown';

import { useDebouncedCallback } from 'use-debounce';

const PageTakeExam = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: sessionQuestions, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-answers/student`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    const [ page, setPage ] = useState(parseInt(router.query.pageId));
    const [ questions, setQuestions ] = useState(undefined);

    useEffect(() => {
        setPage(parseInt(router.query.pageId));
    }, [router.query.pageId]);

    useEffect(() => {
        if(sessionQuestions){
            setQuestions(sessionQuestions);
        }
    }, [sessionQuestions]);

    const onAnswer = useDebouncedCallback(useCallback((answer) => {
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
    }, [questions, page, router.query.sessionId, showSnackbar]), 500);

    const hasAnswered = useCallback((page) => {
        let question = questions[page - 1];
        return question.studentAnswer && question.studentAnswer[question.type] !== undefined;
    }, [questions]);

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        let text = examSession.label ? `${examSession.label} is not in progress.` : 'This exam session is not in progress.';
        return <LoadingAnimation text={text} />;       
    } 
    
    return (
        <LayoutFullScreen appBarContent={
            <Stack direction="row" alignItems="center">
                {examSession.startAt && examSession.endAt && (
                    <Box sx={{ ml:2 }}>
                        <ExamSessionCountDown startDate={examSession.startAt} endDate={examSession.endAt} />
                    </Box>
                )}
                {questions && questions.length > 0 && (
                    <QuestionPages 
                        count={questions.length} 
                        page={page} 
                        hasAnswered={hasAnswered} 
                    />
                )}
            </Stack>
        }>
        <Stack sx={{ minWidth:'100%', minHeight: '100%' }}>
            { questions && questions.length > 0 && questions[page - 1] && (
                <StudentAnswer
                    question={questions[page - 1]}
                    totalPages={questions.length}
                    page={page} 
                    onAnswer={onAnswer}
                />
            )}
        </Stack>    
        </LayoutFullScreen>        
    )
}

export default PageTakeExam;