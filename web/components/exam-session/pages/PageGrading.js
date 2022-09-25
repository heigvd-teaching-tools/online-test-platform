import { useCallback, useEffect, useState } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";

import { Stack, Box, Divider, TextField, Paper } from "@mui/material";
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


const PageGrading = () => {
    const router = useRouter();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: sessionQuestions, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-grading/official`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    useEffect(() => {
        console.log('sessionQuestions', sessionQuestions);
    }, [sessionQuestions]);


    const onSignOff = useCallback((grading) => {
        mutate((sessionQuestions) => {
            const newSessionQuestions = [...sessionQuestions];
            newSessionQuestions[router.query.activeQuestion - 1].studentGrading = newSessionQuestions[router.query.activeQuestion - 1].studentGrading.map((studentGrading) => {
                if (studentGrading.user.id === grading.user.id) {
                    return grading;
                }
                return studentGrading;
            });
            console.log('newSessionQuestions', newSessionQuestions);
            return newSessionQuestions;

        }, true);
    }, [router.query.activeQuestion, mutate]);


    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    return (
        <LayoutSplitScreen 
            header={<MainMenu />}
            subheader={
                sessionQuestions && sessionQuestions.length > 0 && (
                    <QuestionPages
                        count={sessionQuestions.length}
                        page={router.query.activeQuestion}
                        link={(page) => `/exam-sessions/${router.query.sessionId}/grading/${page}?participantId=${router.query.participantId}`}
                        isFilled={() => true}
                    />
                )               
            }
            leftPanel={
                <Stack direction="row" sx={{ position:'relative', height:'100%'   }}>
                    {
                    examSession && <>
                    
                    { sessionQuestions && (
                        <QuestionView 
                            question={sessionQuestions[router.query.activeQuestion - 1]}
                            page={router.query.activeQuestion}
                            count={sessionQuestions.length}
                        />
                    )}                    
                    </>   
                }</Stack>
            }
            rightWidth={75}
            rightPanel={
                <Stack direction="row" sx={{ position:'relative', height:'100%', overflowX:'auto', pb:12 }}>
                    <ParticipantNav 
                        participants={examSession.students} 
                        active={examSession.students.find((student) => student.user.id === router.query.participantId)}
                        onParticipantClick={(participant) => {
                            router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participant.user.id}`);
                        }}
                        isFilled={(participant) => {
                            const grading = sessionQuestions[router.query.activeQuestion - 1].studentGrading.find((studentGrading) => studentGrading.user.id === participant.user.id);
                            return grading && grading.signedBy;
                        }}
                    />    
                    <Divider 
                        orientation="vertical" 
                        light 
                        flexItem 
                    />     
                {sessionQuestions && (
                    <AnswerCompare
                        question={sessionQuestions && sessionQuestions[router.query.activeQuestion - 1]}
                        answer={sessionQuestions && sessionQuestions[router.query.activeQuestion - 1].studentAnswer.find((answer) => answer.user.id === router.query.participantId)}
                    />
                )}
                <GradingSignOff
                    grading={sessionQuestions && sessionQuestions[router.query.activeQuestion - 1].studentGrading.find((grading) => grading.user.id === router.query.participantId)}
                    onSignOff={onSignOff}
                />
                </Stack>
            }
        />  
    )
}

export default PageGrading;