import { useCallback, useMemo } from "react"
import Image from "next/image"
import { StudentAnswerStatus } from "@prisma/client"
import { IconButton, Stack, Tooltip, Typography } from "@mui/material"

import UserAvatar from "@/components/layout/UserAvatar"
import Datagrid from "@/components/ui/DataGrid"
import FilledBullet from "@/components/feedback/FilledBullet"
import PiePercent from "@/components/feedback/PiePercent"

import DateTimeAgo from "@/components/feedback/DateTimeAgo"


const StudentList = ({ groupScope, evaluationId, title, students, questions = [] }) => {

    const columns = [
        {
            label: 'Student',
            column: { minWidth: 230, flexGrow: 1 },
            renderCell: (row) => <UserAvatar user={row.user} />,
        },
        {
            label: 'Registered at',
            column: { minWidth: 170, width: 170 },
            renderCell: (row) => <>
                <Typography variant="body2">{new Date(row.registeredAt).toLocaleString()}</Typography>
                <Typography variant="caption">
                    <DateTimeAgo date={new Date(row.registeredAt)} />
                </Typography>
            </>,
        },
    ]

    const getBulletState = (studentAnswerStatus) => {
        switch (studentAnswerStatus) {
            case StudentAnswerStatus.MISSING:
                return 'empty'
            case StudentAnswerStatus.IN_PROGRESS:
                return 'half'
            case StudentAnswerStatus.SUBMITTED:
                return 'filled'
            default:
                return 'empty'
        }
    }

    // Create dynamic columns for each question
    const questionColumns = useMemo( () => questions.map(q => ({
        label: `Q${q.order + 1}`, // Assuming questions order starts at 0
        tooltip: q.question.title,
        column: { width: 40 },
        renderCell: (row) => <FilledBullet state={getBulletState(getStudentAnswerStatus(row.user.email, q.question.id))} />,
    })), [questions]);

    if(questionColumns.length > 0) {
        columns.push({
            label: 'Actions',
            column: { minWidth: 90, width: 90 },
            renderCell: (row) => <Tooltip title="Spy student" key="view-student-answers">
                <a href={`/${groupScope}/evaluations/${evaluationId}/consult/${row.user.email}/1`} target="_blank">
                <IconButton size="small">
                    <Image
                        alt="View"
                        src="/svg/icons/view-user.svg"
                        width="18"
                        height="18"
                    />
    
                </IconButton>
                </a>
            </Tooltip>
        })
        columns.push({
            label: 'Overall',
            column: { minWidth: 90, width: 90 },
            renderCell: (row) => <PiePercent value={getSubmissionPercentage(row.user.email) || 0} />,
        })
        columns.push(...questionColumns)
    }

    // Utility function to get users's answer status by question id and users email
    const getStudentAnswerStatus = useCallback((studentEmail, questionId) => {
        const relevantQuestion = questions.find(q => q.question.id === questionId);
        if (!relevantQuestion) return StudentAnswerStatus.MISSING;

        const answer = relevantQuestion.question.studentAnswer.find(sa => sa.userEmail === studentEmail);
        return answer ? answer.status : StudentAnswerStatus.MISSING;
    }, [questions]);

    // Utility function to calculate the percentage of submitted answers for a users
    const getSubmissionPercentage = useCallback((studentEmail) => {
        const submittedAnswersCount = questions.reduce((count, q) => {
            const answer = q.question.studentAnswer.find(sa => sa.userEmail === studentEmail && sa.status === StudentAnswerStatus.SUBMITTED);
            return answer ? count + 1 : count;
        }, 0);

        return Math.round((submittedAnswersCount / questions.length) * 100);
    }, [questions]);

    return (
        <Stack>
            <Typography variant="h6">{title}</Typography>
            <Datagrid
                header={{ columns: columns }}
                items={
                    students?.map(student => ({
                        ...student,
                        meta: {
                            key: student.user.id,
                        }
                    }))
                }
            />
        </Stack>
    )
}


export default StudentList
