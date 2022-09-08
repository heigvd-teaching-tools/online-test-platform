import { ExamSessionPhase } from '@prisma/client';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { StepLabel, StepContent, Typography,  Chip, Stack, Box } from '@mui/material';
import DateCountdown from '../../../components/ui/DateCountdown';
import MinutesSelector from '../../../components/exam-session/in-progress/MinutesSelector';
import { useRouter } from 'next/router';
import ExamSessionCountDown from './ExamSessionCountDown';

const StepInProgress = ({ examSession, handleSave }) => {
    const router = useRouter();
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
                        <ExamSessionCountDown
                            startDate={examSession.startAt}
                            endDate={examSession.endAt}
                            onFinish={async () => {
                                //await handleSave(ExamSessionPhase.CORRECTION);
                                //router.push(`/exam-sessions/${router.query.sessionId}/correction`);
                            }}
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