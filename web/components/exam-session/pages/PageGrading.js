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

const ParticipantItem = ({ participant, active, collapsed, onClick }) => {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ p: 1, display:'inline-flex', cursor: 'pointer' }} onClick={onClick}>
            <Stack direction="row" spacing={1}>
                {active ? (
                    <Box sx={{ width: 3, bgcolor: 'secondary.main' }} /> 
                ) : (
                    <Box sx={{ width: 3, bgcolor: 'transparent' }} />
                )}
                <UserAvatar 
                    collapsed={collapsed}
                    user={participant} 
                />
                
            </Stack>
            <FilledBullet
                index={0}
                isFilled={(index) => true}
            />
        </Stack>
    )
}

const ParticipantNav = ({ participants, active, onParticipantClick }) => {
    const [ collapsed, setCollapsed ] = useState(true);

    return (
        <Stack spacing={1} sx={{ p:1, display:'inline-flex' }} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
            {
                participants.map(
                    (participant) => (
                        <ParticipantItem 
                            key={participant.user.id}
                            active={active && active.user.id === participant.user.id}
                            collapsed={collapsed}
                            participant={participant.user}
                            onClick={() => onParticipantClick(participant)}
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
                        link={(page) => `/exam-sessions/${router.query.sessionId}/grading/${page}?participantId=${router.query.participantId}`}
                        isFilled={() => true}
                    />
                )               
            }
            leftPanel={
                <>{
                    examSession && 
                    <ParticipantNav 
                        participants={examSession.students} 
                        active={examSession.students.find((student) => student.user.id === router.query.participantId)}
                        onParticipantClick={(participant) => {
                            router.push(`/exam-sessions/${router.query.sessionId}/grading/${router.query.activeQuestion}?participantId=${participant.user.id}`);
                        }}
                    />
                }</>
            }
            rightPanel={
                <></>
            }
        />  
    )
}

export default PageGrading;