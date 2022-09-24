import { useEffect, useState, useCallback } from 'react';
import useSWR, { SWRConfig  } from "swr";
import { useRouter } from "next/router";
import { StudentQuestionGradingStatus } from '@prisma/client';

import { Stack, Box, Drawer, Divider, Typography, Chip, Avatar, TextField, Paper } from "@mui/material";

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";

import { useSnackbar } from '../../../context/SnackbarContext';

import { useDebouncedCallback } from 'use-debounce';
import QuestionPages from '../take/QuestionPages';
import MainMenu from '../../layout/MainMenu';
import UserAvatar from '../../layout/UserAvatar';
import FilledBullet from '../../feedback/FilledBullet';
import QuestionView from '../take/QuestionView';

import AnswerCompare from '../../answer/AnswerCompare';

const ParticipantItem = ({ participant, active, collapsed, onClick }) => {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ pt: 1, pr:1, pb:1, display:'inline-flex', cursor: 'pointer' }} onClick={onClick}>
            <Stack direction="row" spacing={0}>
                {active ? (
                    <Box sx={{ width: 2, bgcolor: 'primary.main' }} /> 
                ) : (
                    <Box sx={{ width: 2, bgcolor: 'transparent' }} />
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
        <Stack spacing={0} sx={{ pl:1, pr:1, display:'inline-flex', bgcolor: 'background.paper' }} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
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
                />
                </Stack>
            }
        />  
    )
}


import RateReviewSharpIcon from '@mui/icons-material/RateReviewSharp';
const GradingSignOff = ({ grading }) => {

    const [ comment, setComment ] = useState();
    const [ points, setPoints ] = useState();

    useEffect(() => {
        setComment(grading && grading.comment);
        setPoints(grading && grading.pointsObtained);
    }, [grading]);

    return (
        grading && (
        <Paper sx={{ position:'absolute', bottom:0, left:0, right:0, height: 90 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height:'100%', p:2 }} >
            <Stack direction="row" alignItems="center" spacing={1}>       
            <TextField
                sx={{width:60}}
                id="outlined-points"
                label="Points"
                type="number"
                variant="filled"
                value={points}
                onChange={(event) => {
                    setPoints(event.target.value);
                }}
            />

            <TextField
                label="Comment"
                multiline
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                variant="filled"
            />

            <GradingStatus grading={grading} />
            </Stack>

            <LoadingButton
                color='success'
                variant="contained"
                loading={false}
                loadingPosition="start"
                startIcon={<RateReviewSharpIcon />}
                onClick={() => {
                    console.log('save');
                }}
            >
                Sign Off
            </LoadingButton>

        </Stack>
        </Paper>
        )
    )
}


import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { LoadingButton } from '@mui/lab';

const GradingStatus = ({ grading }) => {
    return (
        <Chip 
            variant="filled"
            color={gradingStatusColor(grading.status)}
            avatar={
                <Stack alignItems="center" justifyContent="center" sx={{ ml:2, width:24, height:24, borderRadius: '50%',backgroundColor: 'white' }}>
                    { grading.status !== StudentQuestionGradingStatus.UNGRADED && 
                        (grading.isCorrect ? 
                            <CheckIcon
                                sx={{ color: 'success.main', width:16, height:16 }}
                            /> 
                        : 
                            <ClearIcon
                                sx={{ color: 'error.main', width:16, height:16 }}
                            /> 
                        )}    

                    { grading.status === StudentQuestionGradingStatus.UNGRADED && (
                        <PriorityHighIcon 
                            sx={{ color: `${gradingStatusColor(grading.status)}.main`, width:16, height:16 }}
                        />
                    )}                    
                </Stack>
            }
            label={
                <Typography variant="caption">
                    {
                    ((status) => {
                        switch (status) {
                            case StudentQuestionGradingStatus.UNGRADED:
                                return 'Not Graded';
                            case StudentQuestionGradingStatus.GRADED:
                                return 'Graded';
                            case StudentQuestionGradingStatus.AUTOGRADED:
                                return 'Autograded';
                            default:
                                return 'Unknown';
                        }
                    })(grading.status)
                    }
                </Typography>
            } 
        />
    )
}

const gradingStatusColor = (status) => {
    switch (status) {
        case StudentQuestionGradingStatus.UNGRADED:
            return 'warning';
        case StudentQuestionGradingStatus.GRADED:
            return 'success';
        case StudentQuestionGradingStatus.AUTOGRADED:
            return 'info';
        default:
            return 'error';
    }
}

/*
<AnswerEditor 
                    question={sessionQuestions && sessionQuestions[router.query.activeQuestion - 1]}
                />

*/

export default PageGrading;