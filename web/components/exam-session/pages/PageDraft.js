import { useState, useCallback } from 'react';
import { ExamSessionPhase } from '@prisma/client';

import { Stepper, Step, Stack, Typography  } from "@mui/material";
import MainLayout from '../../layout/MainLayout';
import { useRouter } from 'next/router';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useExamSession } from '../../../context/ExamSessionContext';
import StepNav from '../StepNav';
import StepGeneralInformation from '../draft/StepGeneralInformation';
import StepSchedule from '../draft/StepSchedule';

import DialogFeedback from '../../feedback/DialogFeedback';
import RegistrationClipboard from '../RegistrationClipboard';

const PageDraft = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { examSession, activeStep, stepBack, stepNext, save, saving} = useExamSession();
    const [ finalStepDialogOpen, setFinalStepDialogOpen ] = useState(false);

    const [ duration, setDuration ] = useState(undefined);
    const onDurationChange = useCallback((duration) => setDuration(duration), [setDuration]);

    const inputControl = (step) => {
        switch(step){
            case 0:
                return examSession.label.length > 0;
            default:
                return true;
        }
    }

    const handleBack = () => {
        stepBack();
    }

    const handleNext = async () => {
        if(inputControl(activeStep)){
            if(stepNext()){
                await save({
                    phase: ExamSessionPhase.DRAFT,
                    label: examSession.label,
                    conditions: examSession.conditions
                }).then(() => {
                    showSnackbar('Saved', 'success');
                }).catch(() => {
                    showSnackbar('Error', 'error');
                });
            }
        }
    }

    const handleFinalStep = () => {
        setFinalStepDialogOpen(true);
    }

    const endDraftPhase = async () => {
        setFinalStepDialogOpen(false);
        await save({
            phase: ExamSessionPhase.IN_PROGRESS,
            label: examSession.label,
            conditions: examSession.conditions,
            duration
        });
        router.push(`/exam-sessions/${examSession.id}/in-progress/1`);
    }

    return (
        <MainLayout>
        
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>          
            <RegistrationClipboard sessionId={examSession.id} />
            <Stepper activeStep={activeStep} orientation="vertical">
            
            <Step key="general">
                <StepGeneralInformation 
                    examSession={examSession} 
                    onChange={(data)=>{
                        examSession.label = data.label;
                        examSession.conditions = data.conditions;
                    }}
                />
            </Step>
            <Step key="scheduling-registration">
                <StepSchedule
                    examSession={examSession}
                    onChange={onDurationChange}
                />
            </Step>   
                                
            </Stepper>      

            <StepNav 
                activeStep={activeStep} 
                totalSteps={2}
                phase={examSession.phase} 
                saveRunning={saving} 
                onBack={handleBack} 
                onNext={handleNext} 
                onFinalStep={handleFinalStep}
            />
            <DialogFeedback 
                open={finalStepDialogOpen} 
                title="End of DRAFT phase"
                content={
                    <>
                    <Typography variant="body1" gutterBottom>You are about to go into the <b>in-progress</b> phase.</Typography>
                    <Typography variant="body1" gutterBottom>Registered students will be able to start with their exam session.</Typography>
                    <Typography variant="body1" gutterBottom>Late student registrations will still be possible.</Typography>
                    {duration && (
                        <Typography variant="body1" gutterBottom>End time estimated at <b>{new Date(Date.now() + (duration.hours * 60 + duration.minutes) * 60000).toLocaleTimeString()}</b>.</Typography>
                    )}
                    <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
                    </>
                }
                onClose={() => setFinalStepDialogOpen(false)}
                onConfirm={endDraftPhase}
            />
        </Stack>
        </MainLayout>
    )
}

export default PageDraft;