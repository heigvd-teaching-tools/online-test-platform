import { useEffect, useState, useCallback } from 'react';
import useSWR, { SWRConfig  } from "swr";
import { useRouter } from "next/router";
import { ExamSessionPhase } from '@prisma/client';

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";

import { useSnackbar } from '../../../context/SnackbarContext';

import { useDebouncedCallback } from 'use-debounce';
import QuestionPages from '../take/QuestionPages';
import MainMenu from '../../layout/MainMenu';
import UserAvatar from '../../layout/UserAvatar';
import FilledBullet from '../../feedback/FilledBullet';

const ParticipantItem = ({ participant, active }) => {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ p: 1, cursor: 'pointer' }}>
            <Stack direction="row" alignItems="stretch" spacing={1}>
                <Box sx={{ width: 3, bgcolor: 'secondary.main' }} /> 
                <Box sx={{ maxWidth: 200, overflow:'hidden' }}>
                    <UserAvatar user={participant} />
                </Box>
            </Stack>
            <FilledBullet
                index={0}
                isFilled={(index) => true}
            />
        </Stack>
    )
}

const ParticipantNav = ({ participants }) => {
    return (
        <Stack spacing={1} sx={{ p:1 }}>
            {
                participants.map(
                    (participant) => (
                        <ParticipantItem 
                            key={participant.user.id}
                            participant={participant.user}
                        />
                    )
                )
            }
        </Stack>
    )
}

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
                        link={(page) => `/exam-sessions/${router.query.sessionId}/grading/${page}`}
                        isFilled={() => true}
                    />
                )               
            }
            leftPanel={
                <>
                    {
                        examSession && 
                        <ParticipantNav 
                            participants={examSession.students} 
                        />
                    }
                
                </>
            }
            rightPanel={
                <></>
            }
        />  
    )
}

export default PageGrading;