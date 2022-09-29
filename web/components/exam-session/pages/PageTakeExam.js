import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { ExamSessionPhase } from '@prisma/client';
import { useSession } from "next-auth/react";

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import LoadingAnimation from "../../feedback/LoadingAnimation";
import QuestionPages from '../take/QuestionPages';
import { useSnackbar } from '../../../context/SnackbarContext';
import ExamSessionCountDown from '../in-progress/ExamSessionCountDown';

import QuestionView from '../take/QuestionView';
import QuestionNav from '../take/QuestionNav';
import AnswerEditor from '../../answer/AnswerEditor';

import { useDebouncedCallback } from 'use-debounce';
// TODO : Bye bye
const PageTakeExam = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { data } = useSession();

    const { data: examSession, error, mutate } = useSWR(
        `/api/users/${data && data.user.email}/exam-sessions/${router.query.sessionId}?questions=true`,
        data && router.query.sessionId ? 
            (...args) => 
                fetch(...args)
                .then((res) => {
                    if(!res.ok){
                        switch(res.status){
                            case 403:
                                throw new Error('You are not allowed to access this exam session');
                            default:
                                throw new Error('An error occurred while fetching the data.');
                        }
                    }
                    return res.json();
                }) 
            : null,
            { revalidateOnFocus: false }
    );

    const [ page, setPage ] = useState(parseInt(router.query.pageId));

    useEffect(() => {
        setPage(parseInt(router.query.pageId));
    }, [router.query.pageId]);

    const onAnswer = useDebouncedCallback(useCallback((answer) => {
        (async () => {
            await fetch(`/api/exam-sessions/${router.query.sessionId}/questions/${examSession.questions[page - 1].id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ answer: answer })
            })
            .then(data => {
                if(!data.ok){
                    if(data.status === 400){
                        showSnackbar('The answer is not submited, this exam session is not in the in-progress phase', 'error');
                    }else {
                        showSnackbar('The answer is not submited, an error occurred', 'error');
                    }
                    return;
                }
                examSession.questions[page - 1].studentAnswer = [{
                    [examSession.questions[page - 1].type]: answer
                }];
                if(answer === undefined){
                    examSession.questions[page - 1].studentAnswer = [];
                    showSnackbar('Your answer has been removed', 'success');
                }else{
                    showSnackbar('Answer submitted successfully', 'success');
                }
            }).catch(err => {
                showSnackbar('Error submitting answer', 'error');
            });
        })();
    }, [examSession, page, router.query.sessionId, showSnackbar]), 500);

    const hasAnswered = useCallback((questionId) => {
        let question = examSession.questions.find(q => q.id === questionId);
        return question && question.studentAnswer.length > 0 && question.studentAnswer[0][question.type] !== undefined;
    }, [examSession]);

    if(error) return <LoadingAnimation content={error.message} />     
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        let text = examSession.label ? `${examSession.label} is not in progress.` : 'This exam session is not in progress.';
        return <LoadingAnimation text={text} />;       
    } 
    
    return (
        <LayoutSplitScreen 
            header={
                <Stack direction="row" alignItems="center">
                    {examSession.startAt && examSession.endAt && (
                        <Box sx={{ ml:2 }}>
                            <ExamSessionCountDown startDate={examSession.startAt} endDate={examSession.endAt} />
                        </Box>
                    )}
                    {examSession.questions && examSession.questions.length > 0 && (
                        <QuestionPages 
                            questions={examSession.questions}
                            activeQuestion={examSession.questions[page - 1]}
                            link={(_, index) => `/exam-sessions/${router.query.sessionId}/take/${index + 1}`}
                            isFilled={hasAnswered} 
                        />
                    )}
                </Stack>
            }
            leftPanel={
                examSession.questions && examSession.questions.length > 0 && examSession.questions[page - 1] && (
                <>
                    <Box sx={{ height: 'calc(100% - 50px)' }}>
                        <QuestionView 
                            question={examSession.questions[page - 1]} 
                            page={page} 
                            totalPages={examSession.questions.length} 
                        />
                    </Box>
                    <QuestionNav 
                        page={page} 
                        totalPages={examSession.questions.length} 
                    />
                </>
            )}
            rightPanel={
                examSession.questions && examSession.questions.length > 0 && examSession.questions[page - 1] && (
                <Stack sx={{ height:'100%', pt:1 }}>
                    <AnswerEditor 
                        question={examSession.questions[page - 1]}
                        onAnswer={onAnswer} 
                    />      
                </Stack>  
            )}
        />  
    )
}

export default PageTakeExam;