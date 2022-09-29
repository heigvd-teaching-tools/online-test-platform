import { useCallback, useEffect, useState, useRef } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { StudentQuestionGradingStatus, ExamSessionPhase } from '@prisma/client';
import Image from 'next/image';

import { Stack, Box, Divider, TextField, Paper, Button, Menu, MenuList, MenuItem, Typography, CircularProgress } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import LayoutSplitScreen from '../../layout/LayoutSplitScreen';
import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";

import { useExamSession } from '../../../context/ExamSessionContext';
import { useSnackbar } from '../../../context/SnackbarContext';

import { useDebouncedCallback } from 'use-debounce';
import QuestionPages from '../take/QuestionPages';
import MainMenu from '../../layout/MainMenu';
import QuestionView from '../take/QuestionView';

import AnswerCompare from '../../answer/AnswerCompare';
import GradingSignOff from '../grading/GradingSignOff';
import ParticipantNav from '../grading/ParticipantNav';
import { useSession } from "next-auth/react";
import LayoutMain from '../../layout/LayoutMain';
import Datagrid from '../../ui/DataGrid';
import UserAvatar from '../../layout/UserAvatar';

const PageFinished = () => {
    const router = useRouter();
    const { data:session } = useSession();

    const { examSession, save, saving } = useExamSession();

    const { data, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-grading/official`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    const [ questions, setQuestions ] = useState([]);
    const [ participants, setParticipants ] = useState([]);
    
    useEffect(() => {
        if(data){
            setQuestions(data)
        }
    }, [data]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setParticipants(questions[0].studentGrading.map((sg) => sg.user).sort((a, b) => a.name.localeCompare(b.name)));
        }
    }, [questions]);

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

    const questionColumns = () => questions.map((question) => {
            return {
                label: `Q${question.order + 1}`,
                column: {
                    width: '80px'
                }
            }
        });



    const gridHeaders = {
        columns: [
        {
            label: 'Participant',
            column: { flexGrow: 1, }
        },
        ...questionColumns(),
        {
            label: 'Success rate',
            column: { width: '80px' }
        }
        ]
    };
    console.log("question columns", questionColumns(), questions);
    const gridRows = () => participants.map((participant) => {

        const participantQuestions = questions.map((question) => {
            const grading = question.studentGrading.find((sg) => sg.user.email === participant.email);
            return grading ? grading.pointsObtained : 0;
        });
        console.log("participant questions", participant, participantQuestions);
        return {
            participant: <UserAvatar user={participant} />,
            ...participantQuestions,
            successRate: `${getSuccessRate()}%`
        }
    });

   
    return (
        <>
           { questions && (
            <LayoutMain>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6">Overall success rate</Typography>
                    <PiePercent value={getSuccessRate()} />
                </Stack>
                <Datagrid
                    header={gridHeaders}
                    items={gridRows()}
                />
                    

            </LayoutMain>
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


export default PageFinished;