import { useState, useCallback } from 'react';
import { ExamSessionPhase } from '@prisma/client';

import { Stepper, Step, Stack, Typography  } from "@mui/material";
import MainLayout from '../../layout/MainLayout';

import { useSnackbar } from '../../../context/SnackbarContext';
import { useExamSession } from '../../../context/ExamSessionContext';
import StepNav from '../StepNav';
import StepGeneralInformation from '../draft/StepGeneralInformation';
import StepReferenceExam from '../draft/StepReferenceExam';

import DialogFeedback from '../../feedback/DialogFeedback';

const PageDraft = () => {
    const { show: showSnackbar } = useSnackbar();
    const { examSession, activeStep, stepBack, stepNext, save, saving} = useExamSession();
    const [ finalStepDialogOpen, setFinalStepDialogOpen ] = useState(false);

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

    const handleBack = async () => {
        if(stepBack()){
            save({
                phase: ExamSessionPhase.DRAFT,
            }).then(() => {
                showSnackbar('Saved', 'success');
            }).catch(() => {
                showSnackbar('Error', 'error');
            }); 
        }
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
        await save({
            phase: ExamSessionPhase.SCHEDULING,
            questions: examSession.questions
        });
    }

    const onChangeRefenceExam = useCallback((_, questions) => {
        examSession.questions = questions;
    }, [examSession]);

    return (
        <MainLayout>
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>          
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
            <Step key="chose-exam">
                <StepReferenceExam 
                    examSession={examSession}
                    onChange={onChangeRefenceExam}
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
                    <Typography variant="body1" gutterBottom>You are about to move to the scheduling phase. You will not be able to change the exam session anymore.</Typography>
                    <Typography variant="body1" gutterBottom>Next phase is the scheduling phase. You will be able to schedule the exam session and invite students to participate.</Typography>
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