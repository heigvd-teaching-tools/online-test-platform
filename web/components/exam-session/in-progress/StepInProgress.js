import { ExamSessionPhase } from '@prisma/client';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { StepLabel, StepContent, Typography,  Chip, Stack, Box } from '@mui/material';
import DateCountdown from '../../../components/ui/DateCountdown';
import MinutesSelector from '../../../components/exam-session/in-progress/MinutesSelector';
import { useRouter } from 'next/router';
import ExamSessionCountDown from './ExamSessionCountDown';

const StepInProgress = ({ examSession, onDurationChange, onSessionEnd }) => {
    return (
        <>
        <StepLabel>In progress</StepLabel>
            <StepContent>
                { examSession.startAt && examSession.endAt ? 
                    ( 
                        <DurationManager 
                            examSession={examSession} 
                            onChange={onDurationChange}
                            onSessionEnd={onSessionEnd}
                        />
                    ) : 
                    <Stack spacing={4} direction="row" alignItems="center" justifyContent="center">
                        <Box>
                        <Typography variant="h6">The exam session is in progress.</Typography>
                        <Typography variant="body1">Go to the next phase to end the session</Typography>
                        </Box>
                    </Stack>
                }
            </StepContent>
        </>
    )
}

const DurationManager = ({ examSession, onChange, onSessionEnd }) => {
    return (
        <Box pt={4} pb={4}>
            <Stack spacing={4} direction="row" alignItems="center" justifyContent="space-between">
                <MinutesSelector
                    label={'Reduce by'}
                    color="primary"
                    onClick={async (minutes) => {
                        // remove minutes to endAt
                        let newEndAt = new Date(examSession.endAt);
                        newEndAt.setMinutes(newEndAt.getMinutes() - minutes);
                        newEndAt = new Date(newEndAt).toISOString();
                        onChange(newEndAt);
                    }}
                />
                <Typography variant="body1">
                    {`Started at ${new Date(examSession.startAt).toLocaleTimeString()}`}
                </Typography>
                <ExamSessionCountDown
                    startDate={examSession.startAt}
                    endDate={examSession.endAt}
                    onFinish={onSessionEnd}
                />   
                <Typography variant="body1">
                    {`Ends at ${new Date(examSession.endAt).toLocaleTimeString()}`}
                </Typography>
                <MinutesSelector
                    label={'Extend for'}
                    color="info"
                    onClick={async (minutes) => {
                        // add minutes to endAt
                        let newEndAt = new Date(examSession.endAt);
                        newEndAt.setMinutes(newEndAt.getMinutes() + minutes);
                        newEndAt = new Date(newEndAt).toISOString();
                        onChange(newEndAt);
                    }}
                />
            </Stack>
        </Box>
    )
}


export default StepInProgress;