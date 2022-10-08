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
                <Box sx={{ minWidth:'100%' }}>
                    <Toolbar disableGutters variant="dense">
                        <Button onClick={exportAsCSV}>Export as csv</Button>
                    </Toolbar>
                </Box>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6">Overall success rate</Typography>
                    <PiePercent value={ getSignedSuccessRate(questions) } />
                </Stack>
                <DataGrid
                    header={gridHeaders}
                    items={gridRows()}
                />
            </TabPanel>
            <TabPanel value={2} sx={{ minWidth:'100%' }}>
                <Stack spacing={4} alignItems="center" sx={{ width : '100%', mt:2}}>
                    <Typography variant="h6">Question Analytics</Typography>
                    { questions.map((question, index) => <QuestionAnalytics key={index} question={question} />) }
                </Stack>
            </TabPanel>



            </LayoutMain>
           )}
            </TabContext>
        </PhaseRedirect>
    )
}



const QuestionAnalytics = ({ question }) => {
    const [ questionData, setQuestionData ] = useState(null);
    useEffect(() => {
        if(question){
            let data = {
                label: `Q${question.order + 1}`,
                type: question.type,
                [question.type]: typeSpecificStats(question)
            };
            switch(question.type) {
                case QuestionType.multipleChoice: {
                    let maxValue = Math.max(...data[question.type].map((option) => option.chosen));
                    data[question.type] = data[question.type].map((option) => ({ ...option, percentage: Math.round(option.chosen / maxValue * 100) }));
                    break;
                }
                case QuestionType.trueFalse: {
                    let maxValue = Math.max(data[question.type].true.chosen, data[question.type].false.chosen);
                    data[question.type].true.percentage = Math.round(data[question.type].true.chosen / maxValue * 100);
                    data[question.type].false.percentage = Math.round(data[question.type].false.chosen / maxValue * 100);
                    break;
                }
                case QuestionType.code: {
                    let maxValue = Math.max(data[question.type].success.accomplished, data[question.type].failure.accomplished);
                    data[question.type].success.percentage = Math.round(data[question.type].success.accomplished / maxValue * 100);
                    data[question.type].failure.percentage = Math.round(data[question.type].failure.accomplished / maxValue * 100);
                    break;
                }
                default:
                    break;
            }
            setQuestionData(data);
        }
    }, [question]);

    return (
        question.type !== QuestionType.essay &&
        <Paper sx={{p:2, minWidth:'100%'}}>
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width:'32px', height:'32px' }}>
                    <Image src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                </Box>
                <Typography variant="h6"><b>{`Q${question.order + 1}`}</b></Typography>

                <Typography variant="body2">
                    Submitted Answers :
                    { question.studentAnswer.filter((sa) => sa.status === StudentAnswerStatus.SUBMITTED).length}
                    /
                    {question.studentAnswer.length}
                </Typography>
            </Stack>
            { questionData &&
                (
                    (questionData.type === QuestionType.multipleChoice && (
                        <Stack direction="column" alignItems="flex-start" spacing={2} >
                            {
                                questionData[questionData.type].map((option, index) => (
                                    <AnalyticsRow
                                        key={index}
                                        label={option.label}
                                        percent={option.percentage}
                                        amount={option.chosen}
                                    />
                                ))
                            }
                        </Stack>
                    ))
                    ||
                    (questionData.type === QuestionType.trueFalse && (
                        <>
                        <AnalyticsRow
                            label="True"
                            percent={questionData[questionData.type].true.percentage}
                            amount={questionData[questionData.type].true.chosen}
                        />
                        <AnalyticsRow
                            label="False"
                            percent={questionData[questionData.type].false.percentage}
                            amount={questionData[questionData.type].false.chosen}
                        />
                        </>
                    ))
                    ||
                    (questionData.type === QuestionType.code && (
                        <>
                        <AnalyticsRow
                            label="Success"
                            color="success"
                            percent={questionData[questionData.type].success.percentage}
                            amount={questionData[questionData.type].success.accomplished}
                        />
                        <AnalyticsRow
                            label="Failure"
                            color="error"
                            percent={questionData[questionData.type].failure.percentage}
                            amount={questionData[questionData.type].failure.accomplished}
                        />
                        </>
                    ))
                )
            }
            <Stack direction="row" spacing={1} alignItems="center">
                <PiePercent value={ getQuestionSuccessRate(question) } />
                <Typography variant="body1">Success Rate</Typography>
            </Stack>
        </Stack>
        </Paper>
    )
}

const AnalyticsRow = ({ label, percent, amount, color = 'info' }) =>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ width:'100%' }}>
        <Box sx={{ width:45, maxWidth:45 }}>
            <Typography variant="body1">{label}</Typography>
        </Box>
        <Stack sx={{ flex:1 }} direction="row" spacing={2} alignItems="center">
            <LinearPercent percent={percent} thickness={15} color={color}/>
            <Box sx={{ minWidth: 35, width:35 }}>
                <Typography variant="caption" sx={{ textAlign:'center' }}><b>{amount}</b></Typography>
            </Box>
        </Stack>
    </Stack>

const LinearPercent = ({ percent, thickness = 10, color = 'info' }) =>
    <Stack sx={{ flex:1 }}>
        <LinearProgress sx={{ height: thickness }} color={color} variant="determinate" value={percent} />
    </Stack>

export default PageFinished;