import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';

import { Stepper, Step, Stack, Typography  } from "@mui/material";

import LoadingAnimation from '../../../components/layout/LoadingAnimation';

import { useSnackbar } from '../../../context/SnackbarContext';
import StepNav from '../../../components/exam-session/StepNav';
import StepGeneralInformation from '../../../components/exam-session/draft/StepGeneralInformation';
import StepReferenceExam from '../../../components/exam-session/draft/StepReferenceExam';

import DialogFeedback from '../../../components/feedback/DialogFeedback';
const InitiateExamSession = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const [ saveRunning, setSaveRunning ] = useState(false);

    const { data, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ activeStep, setActiveStep ] = useState(1);
    const [ finalStepDialogOpen, setFinalStepDialogOpen ] = useState(false);
    const [ examSession, setExamSession ] = useState(data);
    
    useEffect(() => {
        setExamSession(data);
        setActiveStep(1);
    }, [data, examSession]);

    const inputControl = (step) => {
        switch(step){
            case 0:
                return examSession.label.length > 0;
            case 1:
                if(examSession.questions && examSession.questions.length === 0){
                    showSnackbar('You exam session has no questions. Please select the reference exam.', 'error');
                }
                return examSession.questions && examSession.questions.length > 0;     
            default:
                return true;
        }
    }

    const handleBack = () => {
        let previousStep = activeStep - 1;
        setActiveStep(previousStep);
        handleSave(ExamSessionPhase.DRAFT);
    }

    const handleNext = () => {
        if(inputControl(activeStep)){
            let nextStep = activeStep + 1;
            setActiveStep(nextStep);
            handleSave(ExamSessionPhase.DRAFT);
        }
    }

    const handleFinalStep = () => {
        setFinalStepDialogOpen(true);
    }

    const endDraftPhase = async () => {
        await handleSave(ExamSessionPhase.SCHEDULING);
        router.push(`/exam-sessions/${router.query.sessionId}/scheduling`);
    }

    const handleSave = async (changePhase) => {
        setSaveRunning(true);
        
        await fetch(`/api/exam-sessions/${router.query.sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                ...examSession,
                phase: changePhase,
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

    return (
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>          
            <Stepper activeStep={activeStep} orientation="vertical">
            
            <Step key="general">
                <StepGeneralInformation 
                    examSession={examSession} 
                    onChange={(data)=>{
                        examSession.label = data.label;
                        examSession.description = data.description;
                    }}
                />
            </Step>
            <Step key="chose-exam">
                <StepReferenceExam 
                    examSession={examSession}
                    onChange={(exam, questions)=>{
                        examSession.questions = questions;
                    }}
                />
            </Step>    
                                
            </Stepper>      

            <StepNav 
                activeStep={activeStep} 
                totalSteps={2}
                phase={examSession.phase} 
                saveRunning={saveRunning} 
                onBack={handleBack} 
                onNext={handleNext} 
                onFinalStep={handleFinalStep}
            />
            <DialogFeedback 
                open={finalStepDialogOpen} 
                title="End of DRAFT phase"
                content={
                    <>
                    <Typography variant="body1" gutterBottom>You are about to move to the scheduling phase. You will not be able to change the exam session anymore.</Typography>
                    <Typography variant="body1" gutterBottom>Next phase is the scheduling phase. You will be able to schedule the exam session and invite students to participate.</Typography>
                    <Typography variant="button" gutterBottom> Are you sure you want to continue?`</Typography>
                    </>
                }
                onClose={() => setFinalStepDialogOpen(false)}
                onConfirm={endDraftPhase}
            />
        </Stack>
    )
}

export default InitiateExamSession;