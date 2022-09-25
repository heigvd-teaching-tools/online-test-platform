import { StudentQuestionGradingStatus } from '@prisma/client';

import { Chip, Stack, Typography } from "@mui/material";

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';


const GradingStatus = ({ grading }) => {
    return (
        <Chip 
            variant="filled"
            color={gradingStatusColor(grading.status)}
            avatar={
                <Stack alignItems="center" justifyContent="center" sx={{ ml:2, width:24, height:24, borderRadius: '50%',backgroundColor: 'white' }}>
                    { grading.status !== StudentQuestionGradingStatus.UNGRADED && 
                        (grading.isCorrect ? 
                            <CheckIcon
                                sx={{ color: 'success.main', width:16, height:16 }}
                            /> 
                        : 
                            <ClearIcon
                                sx={{ color: 'error.main', width:16, height:16 }}
                            /> 
                        )}    

                    { grading.status === StudentQuestionGradingStatus.UNGRADED && (
                        <PriorityHighIcon 
                            sx={{ color: `${gradingStatusColor(grading.status)}.main`, width:16, height:16 }}
                        />
                    )}                    
                </Stack>
            }
            label={
                <Typography variant="caption">
                    {
                    ((status) => {
                        switch (status) {
                            case StudentQuestionGradingStatus.UNGRADED:
                                return 'Not Graded';
                            case StudentQuestionGradingStatus.GRADED:
                                return 'Graded';
                            case StudentQuestionGradingStatus.AUTOGRADED:
                                return 'Autograded';
                            default:
                                return 'Unknown';
                        }
                    })(grading.status)
                    }
                </Typography>
            } 
        />
    )
}

const gradingStatusColor = (status) => {
    switch (status) {
        case StudentQuestionGradingStatus.UNGRADED:
            return 'warning';
        case StudentQuestionGradingStatus.GRADED:
            return 'success';
        case StudentQuestionGradingStatus.AUTOGRADED:
            return 'info';
        default:
            return 'error';
    }
}

export default GradingStatus;