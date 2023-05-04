import { useEffect, useState } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import {Stack, Divider, Typography, Button, Tab} from "@mui/material";

import LayoutMain from '../../layout/LayoutMain';
import DataGrid from '../../ui/DataGrid';
import UserAvatar from '../../layout/UserAvatar';
import PiePercent from '../../feedback/PiePercent';
import PhaseRedirect from './PhaseRedirect';
import { getObtainedPoints, getSignedSuccessRate } from "./stats";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import JamSessionAnalytics from "../analytics/JamSessionAnalytics";
import {Role} from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import JoinClipboard from "../JoinClipboard";
import MainMenu from "../../layout/MainMenu";

const PageFinished = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { data:jamSession } = useSWR(
        `/api/jam-sessions/${jamSessionId}`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const { data } = useSWR(
        `/api/jam-sessions/${jamSessionId}/questions?withGradings=true`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );

    const [ tab, setTab ] = useState(1);
    const [ JamSessionToQuestions, setJamSessionToJamSessionToQuestions ] = useState([]);
    const [ participants, setParticipants ] = useState([]);

    useEffect(() => {
        if(data){
            setJamSessionToJamSessionToQuestions(data)
        }
    }, [data]);

    useEffect(() => {
        if (JamSessionToQuestions && JamSessionToQuestions.length > 0) {
            setParticipants(JamSessionToQuestions[0].question.studentAnswer.map((sa) => sa.user).sort((a, b) => a.name.localeCompare(b.name)));
        }
    }, [JamSessionToQuestions]);

    const gridHeaders = () => {

        let q = JamSessionToQuestions.map((jstq) => ({
            label: <b>{`Q${jstq.order + 1}`}</b>,
            column: { width: '50px' }
        }));

        return {
            columns: [{
                label: 'Participant',
                column: { flexGrow: 1, }
            },{
                label: 'Success',
                column: { width: '80px' }
            },
            ...q
            ]
        }
    }

    const gridRows = () => participants.map((participant) => {
        let obtainedPoints = getObtainedPoints(JamSessionToQuestions, participant);
        let totalPoints = JamSessionToQuestions.reduce((acc, jstq) => acc + jstq.points, 0);
        let participantSuccessRate = totalPoints > 0 ? Math.round(obtainedPoints / totalPoints * 100) : 0;

        const questionColumnValues = {};

        JamSessionToQuestions.forEach((jstq) => {
            const grading = jstq.question.studentAnswer.find((sa) => sa.user.email === participant.email).studentGrading;
            let pointsObtained = grading ? grading.pointsObtained : 0;
            let totalPoints = jstq.points;
            let successRate = totalPoints > 0 ? Math.round(pointsObtained / totalPoints * 100) : 0;

            let color = successRate > 70 ? 'success' : successRate > 40 ? 'info' : 'error';
            questionColumnValues[`Q${jstq.order + 1}`] =
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
            meta:{ key: participant.email },
        }
    });

    const exportAsCSV = () => {

        let COLUMN_SEPARATOR = ';';
        let LINE_SEPARATOR = '\r';

        let csv = `Name${COLUMN_SEPARATOR}Email${COLUMN_SEPARATOR}Success Rate${COLUMN_SEPARATOR}Total Points${COLUMN_SEPARATOR}Obtained Points${COLUMN_SEPARATOR}`;
        JamSessionToQuestions.forEach((jstq) => csv += `Q${jstq.order + 1}${COLUMN_SEPARATOR}`);
        csv += LINE_SEPARATOR;

        participants.forEach((participant) => {
            let obtainedPoints = getObtainedPoints(JamSessionToQuestions, participant);

            let totalPoints = JamSessionToQuestions.reduce((acc, jstq) => acc + jstq.points, 0);
            let participantSuccessRate = totalPoints > 0 ? Math.round(obtainedPoints / totalPoints * 100) : 0;

            csv += `${participant.name}${COLUMN_SEPARATOR}${participant.email}${COLUMN_SEPARATOR}${participantSuccessRate}${COLUMN_SEPARATOR}${totalPoints}${COLUMN_SEPARATOR}${obtainedPoints}${COLUMN_SEPARATOR}`;

            JamSessionToQuestions.forEach((jstq) => {
                const grading = jstq.question.studentAnswer.find((sa) => sa.user.email === participant.email).studentGrading;
                let pointsObtained = grading ? grading.pointsObtained : 0;
                csv += `${pointsObtained}${COLUMN_SEPARATOR}`;
            });

            csv += LINE_SEPARATOR;
        });

        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.setAttribute('href', url);

        let sessionLabel = jamSession.label.replace(/ /g, '_').toLowerCase();

        link.setAttribute('download', `jam-session-${jamSession.id}-${sessionLabel}-results.csv`);
        link.click();
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    }

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={jamSession?.phase}>
            <TabContext value={tab}>
               { JamSessionToQuestions && JamSessionToQuestions.length > 0 && (
                   <LayoutMain
                        header={ <MainMenu /> }
                        subheader={
                            <TabList onChange={handleTabChange} >
                                <Tab label="Results" value={1} />
                                <Tab label="Analytics" value={2} />
                            </TabList>
                        }
                        padding={2}
                        spacing={2}
                    >
                        <TabPanel value={1} >
                            <Stack spacing={4}>
                                <JoinClipboard jamSessionId={jamSessionId} />

                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography variant="h6">Overall success rate</Typography>
                                        <PiePercent value={ getSignedSuccessRate(JamSessionToQuestions) } />
                                    </Stack>
                                    <Button onClick={exportAsCSV}>Export as csv</Button>
                                </Stack>

                                <DataGrid
                                    header={gridHeaders()}
                                    items={gridRows()}
                                />
                            </Stack>
                        </TabPanel>
                        <TabPanel value={2}>
                            <JamSessionAnalytics JamSessionToQuestions={JamSessionToQuestions} />
                        </TabPanel>
                </LayoutMain>
               )}
            </TabContext>
        </PhaseRedirect>
        </Authorisation>
    )
}

export default PageFinished;
