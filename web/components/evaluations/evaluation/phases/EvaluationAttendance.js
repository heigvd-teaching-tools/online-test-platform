import {
  Stack,
  Typography,
} from '@mui/material'

import EvaluationTitleBar from '../layout/EvaluationTitleBar'
import JoinClipboard from '../../JoinClipboard'
import StudentsInEvaluation from '../../draft/StudentsInEvaluation'
import DeniedStudentsInEvaluation from '../../draft/DeniedStudentsInEvaluation'
import { useSnackbar } from '@/context/SnackbarContext'

const EvaluationAttendance = ({ groupScope, evaluation, attendance, onAttendanceChanged }) => {

    const evaluationId = evaluation.id   

    const { show: showSnackbar } = useSnackbar()

    return (
        <Stack flex={1} px={1}>
            <EvaluationTitleBar
                title="Attendance"
                action={
                    <JoinClipboard
                        evaluationId={evaluationId}
                    />
                }
            />
            <Stack spacing={1} direction={"row"} width={"100%"}>
            <Stack flex={1}>
              <Typography variant="h6">Registered Students</Typography> 
              <StudentsInEvaluation
                groupScope={groupScope}
                evaluationId={evaluationId}
                students={attendance.registered}
              />
            </Stack>
            { attendance.denied.length > 0 && (
              <Stack flex={1}>
                <Typography variant="h6">Denied Students</Typography>
                <DeniedStudentsInEvaluation
                  groupScope={groupScope}
                  evaluationId={evaluationId}
                  students={attendance.denied}
                  onStudentAllowed={async (_) => {
                    onAttendanceChanged()
                    showSnackbar('Student has been included in the access list')
                  }}
                />
              </Stack>
            )}
            </Stack>
        </Stack>
    )
    
}

export default EvaluationAttendance