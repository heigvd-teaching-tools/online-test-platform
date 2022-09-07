import { ExamSessionPhase } from '@prisma/client';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { StepLabel, StepContent, Typography,  Chip, Stack, Box } from '@mui/material';
import DateCountdown from '../../../components/ui/DateCountdown';
import MinutesSelector from '../../../components/exam-session/in-progress/MinutesSelector';

const StepInProgress = ({ examSession, handleSave }) => {
    return (
        <>
        <StepLabel>In progress</StepLabel>
            <StepContent>
                <Box pt={4} pb={4}>
                    <Stack spacing={4} direction="row" justifyContent="space-between">
                        <MinutesSelector
                            label={'Reduce by'}
                            color="primary"
                            onClick={async (minutes) => {
                                // remove minutes to endAt
                                let newEndAt = new Date(examSession.endAt);
                                newEndAt.setMinutes(newEndAt.getMinutes() - minutes);
                                newEndAt = new Date(newEndAt).toISOString();
                                examSession.endAt = newEndAt;
                                await handleSave(ExamSessionPhase.IN_PROGRESS);
                            }}
                        />
                        <Chip 
                            avatar={<AccessAlarmIcon />}
                            size="large"
                            label={
                                <Typography variant="button">
                                <DateCountdown untilDate={examSession.endAt} />
                                </Typography>
                            } 
                        />
                        <MinutesSelector
                            label={'Extend for'}
                            color="info"
                            onClick={async (minutes) => {
                                // add minutes to endAt
                                let newEndAt = new Date(examSession.endAt);
                                newEndAt.setMinutes(newEndAt.getMinutes() + minutes);
                                newEndAt = new Date(newEndAt).toISOString();
                                examSession.endAt = newEndAt;
                                await handleSave(ExamSessionPhase.IN_PROGRESS);
                            }}
                        />
                    </Stack>
                </Box>
            </StepContent>
        </>
    )
}

export default StepInProgress;