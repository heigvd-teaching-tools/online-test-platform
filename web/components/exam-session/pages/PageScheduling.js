import { useState, useCallback } from 'react';
import { ExamSessionPhase } from '@prisma/client';

import { Stack, Stepper, Step, StepLabel, Typography } from '@mui/material';
import RegistrationClipboard from '../RegistrationClipboard';
import StepNav from '../StepNav';

import { useExamSession } from '../../../context/ExamSessionContext';
import MainLayout from '../../layout/MainLayout';
import StepSchedule from '../schedule/StepSchedule';
import { useSnackbar } from '../../../context/SnackbarContext';
import DialogFeedback from '../../feedback/DialogFeedback';

const PageScheduling = () => {
    const { examSession, activeStep, save, saving} = useExamSession();
    const [ finalStepDialogOpen, setFinalStepDialogOpen ] = useState(false);
    const { show: showSnackbar } = useSnackbar();
  
    const [ duration, setDuration ] = useState(undefined);

    const handleFinalStep = () => setFinalStepDialogOpen(true);
    const onDurationChange = useCallback((duration) => setDuration(duration), [setDuration]);

    const endSchedulingPhase = async () => {
        setFinalStepDialogOpen(false);
        await save({
            phase: ExamSessionPhase.IN_PROGRESS,
            duration
        }).then(() => {
            showSnackbar('Saved', 'success');
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
    }

    return(
        <MainLayout>
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
        <RegistrationClipboard sessionId={examSession.id} />        
        <Stepper activeStep={activeStep} orientation="vertical">
            <Step key="scheduling-registration">
                <StepSchedule
                    examSession={examSession}
                    onChange={onDurationChange}
                />
            </Step>
            <Step key="in-progress">
                <StepLabel>In progress</StepLabel>
            </Step>
        </Stepper>

        <StepNav 
            activeStep={activeStep} 
            totalSteps={1}
            phase={examSession.phase} 
            saveRunning={saving} 
            onFinalStep={handleFinalStep}
        />
        <DialogFeedback 
                open={finalStepDialogOpen} 
                title="End of SCHEDULING phase"
                content={
                    <>
                    <Typography variant="body1" gutterBottom>You are about to go into the <b>in-progress</b> phase.</Typography>
                    <Typography variant="body1" gutterBottom>Students will be able to start with their exam session.</Typography>
                    {duration && (
                        <Typography variant="body1" gutterBottom>End time estimated at <b>{new Date(Date.now() + (duration.hours * 60 + duration.minutes) * 60000).toLocaleTimeString()}</b>.</Typography>
                    )}
                    <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
                    </>
                }
                onClose={() => setFinalStepDialogOpen(false)}
                onConfirm={endSchedulingPhase}
            />
        </Stack>
        </MainLayout>
    )
}

export default PageScheduling;