import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';
import { Stack, Stepper, Step, StepLabel, StepContent, Typography, List, duration } from '@mui/material';
import RegistrationClipboard from '../../../components/exam-session/RegistrationClipboard';
import StepNav from '../../../components/exam-session/StepNav';

import LoadingAnimation from '../../../components/layout/LoadingAnimation';
import StepSchedule from '../../../components/exam-session/schedule/StepSchedule';
import { useSnackbar } from '../../../context/SnackbarContext';
import DialogFeedback from '../../../components/feedback/DialogFeedback';

const ScheduleExamSession = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );
    
    const [ finalStepDialogOpen, setFinalStepDialogOpen ] = useState(false);
    const [ saveRunning, setSaveRunning ] = useState(false);
    const [ activeStep, setActiveStep ] = useState(0);
    const [ examSession, setExamSession ] = useState(data);

    const [ duration, setDuration ] = useState({
        hours: 0,
        minutes: 0,
    });
    
    useEffect(() => {
        setExamSession(data);
    }, [data, examSession]);

    const handleNext = () => {}
    
    const handleBack = () => {}

    const handleFinalStep = () => {
        if(duration.hours * 60 + duration.minutes === 0){
            showSnackbar('Please set the duration of the exam session.', 'error');
            return;
        }
        setFinalStepDialogOpen(true);
    }

    const endSchedulingPhase = async () => {
        setFinalStepDialogOpen(false);
        await handleSave(ExamSessionPhase.IN_PROGRESS);
        router.push(`/exam-sessions/${router.query.sessionId}/in-progress`);
    }


    const handleSave = async (phase) => {
        setSaveRunning(true);
        
        await fetch(`/api/exam-sessions/${router.query.sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                phase,
                duration,
            })
        })
        .then((res) => res.json())
        .then((_) => {
            showSnackbar('Exam session updated successfully');
        }).catch(() => {
            showSnackbar('Error updating exam session', 'error');
        });
        setSaveRunning(false);
    };

    if (errorSession) return <div>failed to load</div>
    if (!examSession) return <LoadingAnimation /> 

    return(
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
        <RegistrationClipboard sessionId={router.query.sessionId} />        
        <Stepper activeStep={activeStep} orientation="vertical">
            <Step key="scheduling-registration">
                <StepSchedule
                    examSession={examSession}
                    onChange={(newDuration) => {
                        setDuration(newDuration);
                    }}
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
            saveRunning={saveRunning} 
            onBack={handleBack} 
            onNext={handleNext} 
            onFinalStep={handleFinalStep}
        />
        <DialogFeedback 
                open={finalStepDialogOpen} 
                title="End of SCHEDULING phase"
                content={
                    <>
                    <Typography variant="body1" gutterBottom>You are about to go into the <b>in-progress</b> phase.</Typography>
                    <Typography variant="body1" gutterBottom>Students will be able to start with their exam session.</Typography>
                    <Typography variant="body1" gutterBottom>End time estimated at <b>{new Date(Date.now() + (duration.hours * 60 + duration.minutes) * 60000).toLocaleTimeString()}</b>.</Typography>
                    <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
                    </>
                }
                onClose={() => setFinalStepDialogOpen(false)}
                onConfirm={endSchedulingPhase}
            />
        </Stack>
    )
}

export default ScheduleExamSession;