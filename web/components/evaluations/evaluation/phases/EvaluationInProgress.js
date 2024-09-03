import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'

import EvaluationTitleBar from '../layout/EvaluationTitleBar'
import JoinClipboard from '../../JoinClipboard'
import { useSnackbar } from '@/context/SnackbarContext'
import StudentProgressGrid from './progress/StudentProgressGrid'


const EvaluationInProgress = ({ groupScope, evaluation, attendance, progress }) => {

    const evaluationId = evaluation.id   

    const { show: showSnackbar } = useSnackbar()

    return (
        <Stack flex={1} px={1}>
            <EvaluationTitleBar
                title="Student Progress"
                action={
                    <JoinClipboard
                        evaluationId={evaluationId}
                    />
                }
            />
            
            <StudentProgressGrid
                groupScope={groupScope}
                evaluationId={evaluationId}
                students={attendance.registered}
                progress={progress}

            />


            
        </Stack>
    )
    
}

export default EvaluationInProgress