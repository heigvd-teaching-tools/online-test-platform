import { useEffect, useState } from 'react';
import useSWR from "swr";
import Image from "next/image";

import { useRouter } from "next/router";
import { QuestionType, StudentAnswerStatus } from '@prisma/client';
import {Stack, Divider, Typography, Toolbar, Button, Box, LinearProgress, Paper, Tab} from "@mui/material";

import LayoutMain from '../../layout/LayoutMain';
import DataGrid from '../../ui/DataGrid';
import UserAvatar from '../../layout/UserAvatar';
import PiePercent from '../../feedback/PiePercent';
import PhaseRedirect from './PhaseRedirect';
import { getObtainedPoints, getSignedSuccessRate, getQuestionSuccessRate, typeSpecificStats } from "./stats";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ExamSessionAnalytics from "../analytics/ExamSessionAnalytics";

const PageFinished = () => {
    const router = useRouter();

    const { data:examSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/phase`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const { data } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/questions/with-grading/official`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    const [ tab, setTab ] = useState(1);
    const [ questions, setQuestions ] = useState([]);
    const [ participants, setParticipants ] = useState([]);
    
    useEffect(() => {
        if(data){
            setQuestions(data)
        }
    }, [data]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setParticipants(questions[0].studentAnswer.map((sa) => sa.user).sort((a, b) => a.name.localeCompare(b.name)));
        }
    }, [questions]);

    const gridHeaders = {
        columns: [{
            label: 'Participant',
            column: { flexGrow: 1, }
        },{
            label: 'Success',
            column: { width: '80px' }
        },
        ...questions.map((question) => ({
            label: <b>{`Q${question.order + 1}`}</b>,
            column: { width: '50px' }
        }))]
    };

    const gridRows = () => participants.map((participant) => {
        let obtainedPoints = getObtainedPoints(questions, participant);
        let totalPoints = questions.reduce((acc, question) => acc + question.points, 0);
        let participantSuccessRate = totalPoints > 0 ? Math.round(obtainedPoints / totalPoints * 100) : 0;

        const questionColumnValues = {};
    
        questions.forEach((question) => {
            const grading = question.studentAnswer.find((sa) => sa.user.email === participant.email).studentGrading;
            let pointsObtained = grading ? grading.pointsObtained : 0;
            let totalPoints = question.points;
            let successRate = totalPoints > 0 ? Math.round(pointsObtained / totalPoints * 100) : 0;

            let color = successRate > 70 ? 'success' : successRate > 40 ? 'info' : 'error';
            questionColumnValues[`Q${question.order + 1}`] = 
                <Typography variant="button" sx={{ color: `${color}.main` }}>
                    <b>{`${pointsObtained}/${totalPoints}`}</b>
                </Typography>
        });

        return {
            participant: <UserAvatar user={participant} />,
            successRate: <PiePercent size={60} value={participantSuccessRate} label={
                <Stack alignItems="center" justifyContent="center" spacing={0}>
                    <Typography variant="body2">{`${obtainedPoints}`}</Typography>
                    <Divider sx={{ width: '100%' }} />
                    <Typography variant="caption">{`${totalPoints}`}</Typography>
                </Stack>
            } />,
            ...questionColumnValues,
        }
    });

    const exportAsCSV = () => {

        let COLUMN_SEPARATOR = ';';
        let LINE_SEPARATOR = '\r';

        let csv = `Name${COLUMN_SEPARATOR}Email${COLUMN_SEPARATOR}Success Rate${COLUMN_SEPARATOR}Total Points${COLUMN_SEPARATOR}Obtained Points${COLUMN_SEPARATOR}`;
        questions.forEach((question) => csv += `Q${question.order + 1}${COLUMN_SEPARATOR}`);
        csv += LINE_SEPARATOR;

        participants.forEach((participant) => {
            let obtainedPoints = getObtainedPoints(questions, participant);

            let totalPoints = questions.reduce((acc, question) => acc + question.points, 0);
            let participantSuccessRate = totalPoints > 0 ? Math.round(obtainedPoints / totalPoints * 100) : 0;
            
            csv += `${participant.name}${COLUMN_SEPARATOR}${participant.email}${COLUMN_SEPARATOR}${participantSuccessRate}${COLUMN_SEPARATOR}${totalPoints}${COLUMN_SEPARATOR}${obtainedPoints}${COLUMN_SEPARATOR}`;
            
            questions.forEach((question) => {
                const grading = question.studentAnswer.find((sa) => sa.user.email === participant.email).studentGrading;
                let pointsObtained = grading ? grading.pointsObtained : 0;
                csv += `${pointsObtained}${COLUMN_SEPARATOR}`;
            });

            csv += LINE_SEPARATOR;
        });

        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.setAttribute('href', url);

        let sessionLabel = examSession.label.replace(/ /g, '_').toLowerCase();

        link.setAttribute('download', `exam-session-${examSession.id}-${sessionLabel}-results.csv`);
        link.click();
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    }

    return (
        <PhaseRedirect phase={examSession?.phase}>
            <TabContext value={tab}>
           { questions && (
            <LayoutMain
                subheader={
                    <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                        <Tab label="Results" value={1} />
                        <Tab label="Analytics" value={2} />
                    </TabList>
                }
            >
            <TabPanel value={1} >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6">Overall success rate</Typography>
                        <PiePercent value={ getSignedSuccessRate(questions) } />
                    </Stack>
                    <Button onClick={exportAsCSV}>Export as csv</Button>
                </Stack>
                <DataGrid
                    header={gridHeaders}
                    items={gridRows()}
                />
            </TabPanel>
            <TabPanel value={2} sx={{ minWidth:'100%' }}>
                <ExamSessionAnalytics questions={questions} />
            </TabPanel>
            </LayoutMain>
           )}
            </TabContext>
        </PhaseRedirect>
    )
}

export default PageFinished;