import { useEffect, useState } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";

import { Stack, Divider, Typography } from "@mui/material";

import { useExamSession } from '../../../context/ExamSessionContext';

import { useSession } from "next-auth/react";
import LayoutMain from '../../layout/LayoutMain';
import Datagrid from '../../ui/DataGrid';
import UserAvatar from '../../layout/UserAvatar';
import PiePercent from '../../feedback/PiePercent';

const PageFinished = () => {
    const router = useRouter();

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
        {
            label: 'Success',
            column: { width: '80px' }
        },
        ...questionColumns(),
        
        ]
    };

    const gridRows = () => participants.map((participant) => {

        let obtainedPoints = questions.reduce((acc, question) => {
            let studentGrading = question.studentGrading.find((sg) => sg.user.id === participant.id);
            return acc + (studentGrading ? studentGrading.pointsObtained : 0);
        }, 0);

        let totalPoints = questions.reduce((acc, question) => acc + question.points, 0);

        let participantSuccessRate = totalPoints > 0 ? Math.round(obtainedPoints / totalPoints * 100) : 0;

        const questionColumnValues = {};
    
        questions.forEach((question) => {
            const grading = question.studentGrading.find((sg) => sg.user.email === participant.email);
            let pointsObtained = grading ? grading.pointsObtained : 0;
            let totalPoints = question.points;
            let successRate = totalPoints > 0 ? Math.round(pointsObtained / totalPoints * 100) : 0;

            let color = successRate > 70 ? 'success' : successRate > 40 ? 'info' : 'error';
            questionColumnValues[`Q${question.order + 1}`] = 
                <Typography variant="button" sx={{ color: `${color}.main` }}>
                    <b>{`${pointsObtained}/${totalPoints}`}</b>
                </Typography>
        });

        let row = {
            participant: <UserAvatar user={participant} />,
            successRate: <PiePercent size={60} value={participantSuccessRate} label={
                <Stack alignItems="center" justifyContent="center" spacing={0}>
                    <Typography variant="body2">{`${obtainedPoints}`}</Typography>
                    <Divider sx={{ width: '100%' }} />
                    <Typography variant="caption">{`${totalPoints}`}</Typography>
                </Stack>
            } />,
            ...questionColumnValues,
        };
        return row
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

export default PageFinished;