import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import {ExamSessionPhase, Role, StudentAnswerStatus} from '@prisma/client';
import { useSession } from "next-auth/react";

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../../layout/LayoutSplitScreen';
import LoadingAnimation from "../../../feedback/LoadingAnimation";
import QuestionPages from '../../take/QuestionPages';
import { useSnackbar } from '../../../../context/SnackbarContext';
import ExamSessionCountDown from '../../in-progress/ExamSessionCountDown';

import QuestionView from '../../take/QuestionView';
import QuestionNav from '../../take/QuestionNav';
import AnswerEditor from '../../../answer/AnswerEditor';

import { useDebouncedCallback } from 'use-debounce';
import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";

const PageTakeExam = () => {
    const router = useRouter();
    const { showTopRight: showSnackbar } = useSnackbar();
    const { data } = useSession();

    const { data:examSessionPhase } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/phase`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { refreshInterval  : 1000 }
    );

    useEffect(() => {
        if(examSessionPhase && examSessionPhase.phase !== ExamSessionPhase.IN_PROGRESS){
            router.push(`/exam-sessions/${router.query.sessionId}/wait`);
        }
    }, [examSessionPhase, router]);


    const { data: userOnExamSession, error } = useSWR(
        `/api/users/exam-sessions/${router.query.sessionId}/take`,
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

    const [ questions, setQuestions ] = useState([]);

    useEffect(() => {
        if(userOnExamSession){
            setQuestions(userOnExamSession.questions);
        }
    }, [userOnExamSession]);

    useEffect(() => {
        setPage(parseInt(router.query.pageId));
    }, [router.query.pageId]);

    const onAnswer = useDebouncedCallback(useCallback((question, answer) => {
        let previousAnswer = { ...question.studentAnswer }; // clone the previous answer to restore it if the api call fails
        question.studentAnswer = [{
            status: answer ? StudentAnswerStatus.SUBMITTED : StudentAnswerStatus.MISSING,
            [question.type]: {
                ...answer
            }
        }];
        (async () => {
            await fetch(`/api/exam-sessions/${router.query.sessionId}/questions/${question.id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ answer: answer })
            })
            .then(data => {
                if(!data.ok){
                    // force re-render to restore the previous answer -> must change the reference of the question object
                    let index = questions.findIndex(q => q.id === question.id);
                    questions[index] = { ...question, studentAnswer: previousAnswer };
                    if(data.status === 400){
                        showSnackbar('The answer is not submited, this exam session is not in the in-progress phase', 'error');
                    }else {
                        showSnackbar('The answer is not submited, an error occurred', 'error');
                    }
                    return;
                }

                if(answer === undefined){
                    showSnackbar('Your answer has been removed', 'success');
                }else{
                    showSnackbar('Answer submitted successfully', 'success');
                }
            }).catch(_ => {
                showSnackbar('Error submitting answer', 'error');
            });
        })();
    }, [questions, router.query.sessionId, showSnackbar]), 300);

    const hasAnswered = useCallback((questionId) => {
        let question = questions.find(q => q.id === questionId);
        return question && question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED && question.studentAnswer[0][question.type] !== undefined;
    }, [questions]);

    if(error) return <LoadingAnimation content={error.message} />     
    if (!userOnExamSession) return <LoadingAnimation />
    if(userOnExamSession && userOnExamSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        let text = userOnExamSession.label ? `${userOnExamSession.label} is not in progress.` : 'This exam session is not in progress.';
        return <LoadingAnimation text={text} />;       
    } 
    
    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            <StudentPhaseRedirect phase={userOnExamSession.phase}>
                <LayoutSplitScreen
                    header={
                        <Stack direction="row" alignItems="center">
                            { userOnExamSession.startAt && userOnExamSession.endAt && (
                                <Box sx={{ ml:2 }}>
                                    <ExamSessionCountDown startDate={userOnExamSession.startAt} endDate={userOnExamSession.endAt} />
                                </Box>
                            )}
                            {questions && questions.length > 0 && (
                                <QuestionPages
                                    questions={questions}
                                    activeQuestion={questions[page - 1]}
                                    link={(_, index) => `/exam-sessions/${router.query.sessionId}/take/${index + 1}`}
                                    isFilled={hasAnswered}
                                />
                            )}
                        </Stack>
                    }
                    leftPanel={
                        questions && questions.length > 0 && questions[page - 1] && (
                        <>
                            <Box sx={{ height: 'calc(100% - 50px)' }}>
                                <QuestionView
                                    question={questions[page - 1]}
                                    page={page}
                                    totalPages={questions.length}
                                />
                            </Box>
                            <QuestionNav
                                page={page}
                                totalPages={questions.length}
                            />
                        </>
                    )}
                    rightPanel={
                        questions && questions.length > 0 && questions[page - 1] && (
                        <Stack sx={{ height:'100%', pt:1 }}>
                            <AnswerEditor
                                question={questions[page - 1]}
                                onAnswer={onAnswer}
                            />
                        </Stack>
                    )}
                />
            </StudentPhaseRedirect>
        </Authorisation>
    )
}

export default PageTakeExam;