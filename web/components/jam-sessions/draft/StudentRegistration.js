import { StudentAnswerStatus } from "@prisma/client"
import { Stack, Typography } from "@mui/material"
import UserAvatar from "../../layout/UserAvatar"
import Datagrid from "../../ui/DataGrid"
import FilledBullet from "../../feedback/FilledBullet"
import PiePercent from "../../feedback/PiePercent"

const StudentRegistration = ({ students, questions = [] }) => {
    // Create dynamic columns for each question
    const questionColumns = questions.map(q => ({
        label: `Q${q.order + 1}`, // Assuming questions order starts at 0
        column: { width: 40 },
    }));

   // Utility function to get student's answer status by question id and student email
   const getStudentAnswerStatus = (studentEmail, questionId) => {
        const relevantQuestion = questions.find(q => q.question.id === questionId);
        if (!relevantQuestion) return StudentAnswerStatus.MISSING;

        const answer = relevantQuestion.question.studentAnswer.find(sa => sa.userEmail === studentEmail);
        return answer ? answer.status : StudentAnswerStatus.MISSING;
    };

    // Utility function to calculate the percentage of submitted answers for a student
    const getSubmissionPercentage = (studentEmail) => {
        const submittedAnswersCount = questions.reduce((count, q) => {
            const answer = q.question.studentAnswer.find(sa => sa.userEmail === studentEmail && sa.status === StudentAnswerStatus.SUBMITTED);
            return answer ? count + 1 : count;
        }, 0);

        return Math.round((submittedAnswersCount / questions.length) * 100);
    };


    return (
        <Stack>
            <Typography variant="h6">Student registration</Typography>
            <Datagrid
                header={{
                    columns: [
                        {
                            label: 'Student',
                            column: { minWidth: 230, flexGrow: 1 },
                        },
                        {
                            label: 'Registered at',
                            column: { minWidth: 170, width: 170 },
                        },
                        {
                            label: 'Overall',
                            column: { minWidth: 90, width: 90 },
                        },
                        ...questionColumns
                    ]
                }}
                items={students?.map(student => ({
                    student: <UserAvatar user={student.user} />,
                    registeredAt: new Date(student.registeredAt).toLocaleString(),
                    submissionPercentage: <PiePercent value={getSubmissionPercentage(student.user.email)} />,
                    ...questions.reduce((acc, q) => {
                        acc[`question${q.order}`] = <FilledBullet isFilled={getStudentAnswerStatus(student.user.email, q.question.id) === StudentAnswerStatus.SUBMITTED} />;
                        return acc;
                    }, {}),
                    meta: {
                        key: student.user.id,
                    }
                }))}
            />
        </Stack>
    )
}


export default StudentRegistration