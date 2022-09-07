import { useState, useEffect } from 'react';
import { ExamSessionPhase } from '@prisma/client';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Stack, Stepper, Step, StepLabel } from '@mui/material';
import RegistrationClipboard from '../../../components/exam-session/RegistrationClipboard';
import StepNav from '../../../components/exam-session/StepNav';

import LoadingAnimation from '../../../components/layout/LoadingAnimation';
import { useSnackbar } from '../../../context/SnackbarContext';
import StepInProgress from '../../../components/exam-session/in-progress/StepInProgress';


const InProgressExamSession = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ saveRunning, setSaveRunning ] = useState(false);
    const [ activeStep, setActiveStep ] = useState(0);
    const [ examSession, setExamSession ] = useState(data);

    useEffect(() => {
        if(!examSession){
            setExamSession(data);
        }
    }, [data, examSession]);

    const handleNext = () => {
        if(duration.hours * 60 + duration.minutes === 0){
            showSnackbar('Please set the duration of the exam session.', 'error');
            return;
        }
        handleSave(ExamSessionPhase.IN_PROGRESS);
        let nextStep = activeStep + 1;
        setActiveStep(nextStep);
    }
    
    const handleBack = () => {
    }

    const handleFinalStep = () => {
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
                phase: phase,
                endAt: examSession.endAt,
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
            <Step key="in-progress">
                <StepInProgress 
                    examSession={examSession}
                    handleSave={handleSave} 
                />
            </Step>
            <Step key="correction">
                <StepLabel>Correction</StepLabel>
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
    
        </Stack>
    )
}


export default InProgressExamSession;