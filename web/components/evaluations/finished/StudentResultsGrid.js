import PiePercent from '@/components/feedback/PiePercent';
import UserAvatar from '@/components/layout/UserAvatar';
import DataGrid from '@/components/ui/DataGrid';
import { Button, ButtonBase, Divider, Stack, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { getObtainedPoints } from '../analytics/stats';
import { useTheme } from '@emotion/react';

const StudentResultsGrid = ({ evaluationToQuestions, actions, questionCellClick }) => {

  const theme = useTheme();

  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      setParticipants(
        evaluationToQuestions[0].question.studentAnswer
          .map((sa) => sa.user)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [evaluationToQuestions]);

  const gridHeaders = () => {
    let q = evaluationToQuestions.map((jstq) => ({
      label: <b>{`Q${jstq.order + 1}`}</b>,
      tooltip: jstq.question.title,
      column: { width: '30px', align: 'center', minWidth: '30px' },
      renderCell: (row) =>  {

    
        const data = row[`Q${jstq.order + 1}`]
        const color = data.signed ? data.successRate > 70 ? theme.palette.success.main : data.successRate > 40 ? theme.palette.info.main : theme.palette.error.main : theme.palette.grey["300"];
        const pointsObtained = data.pointsObtained;
        const totalPoints = data.totalPoints;
          return (
            <ButtonBase sx={{ padding: 1 }} onClick={(ev) => {
                ev.stopPropagation();
                questionCellClick && questionCellClick(jstq.question.id, row.participant.id)
            }}>
                <Stack display="inline-flex" alignItems="center" justifyContent="center" spacing={0.1}>
                <Typography variant="body2" sx={{ color: color }}>{`${pointsObtained}`}</Typography>
                <Divider sx={{ width:"100%", borderBottom: "1px solid", borderColor: color }} />
                <Typography variant="body2" sx={{ color: color }}>{`${totalPoints}`}</Typography>
                </Stack>
            </ButtonBase>
          )
      }
    }))


    const columns = [
        {
          label: 'Participant',
          column: { flexGrow: 1, minWidth: '200px' },
          renderCell: (row) => <UserAvatar user={row.participant} />
        }
    ]

    if (actions) {
        columns.push({
            label: 'Actions',
            column: { width: '80px', minWidth: '80px' },
            renderCell: (row) => actions(row),
        })
    }

    columns.push( {
        label: 'Success',
        column: { width: '80px', minWidth: '80px' },
        renderCell: (row) => <PiePercent
          size={60}
          value={row.participantSuccessRate}
          label={
            <Stack alignItems="center" justifyContent="center" spacing={0}>
              <Typography variant="body2">{`${row.obtainedPoints}`}</Typography>
              <Divider sx={{ width: '100%' }} />
              <Typography variant="caption">{`${row.totalPoints}`}</Typography>
            </Stack>
          }
        />,
      })

    columns.push(...q)
    
    return {
      columns: columns,
    }
  }

  const gridRows = () =>
    participants.map((participant) => {
      let obtainedPoints = getObtainedPoints(evaluationToQuestions, participant)
      let totalPoints = evaluationToQuestions.reduce(
        (acc, jstq) => acc + jstq.points,
        0
      )
      let participantSuccessRate =
        totalPoints > 0 ? Math.round((obtainedPoints / totalPoints) * 100) : 0

      const questionColumnValues = {}

      evaluationToQuestions.forEach((jstq) => {
        const grading = jstq.question.studentAnswer.find(
          (sa) => sa.user.email === participant.email
        ).studentGrading;
        let pointsObtained = grading ? grading.pointsObtained : 0;
        let totalPoints = jstq.points;
        let successRate = totalPoints > 0 ? Math.round((pointsObtained / totalPoints) * 100) : 0;
      
        questionColumnValues[`Q${jstq.order + 1}`] = {
          pointsObtained: pointsObtained,
          totalPoints: totalPoints,
          successRate: successRate,
          signed: grading?.signedBy !== null,
        };
      });

      return {
        participant: participant,
        email: participant.email,
        participantSuccessRate:participantSuccessRate,
        obtainedPoints: obtainedPoints,
        totalPoints: totalPoints,
        ...questionColumnValues,
        meta: {
          key: participant.email,
        },
      }
    })

  return (
    <DataGrid header={gridHeaders()} items={gridRows()} />
  );
};

export default StudentResultsGrid;
