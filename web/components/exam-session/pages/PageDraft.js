import { useState, useCallback } from 'react';
import { ExamSessionPhase } from '@prisma/client';

import { Stack  } from "@mui/material";
import LayoutMain from '../../layout/LayoutMain';
import { useRouter } from 'next/router';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useExamSession } from '../../../context/ExamSessionContext';

import StepReferenceExam from '../draft/StepReferenceExam';
import StepGeneralInformation from '../draft/StepGeneralInformation';
import StepSchedule from '../draft/StepSchedule';

import RegistrationClipboard from '../RegistrationClipboard';
import { LoadingButton } from '@mui/lab';

const PageDraft = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { examSession, save, saving} = useExamSession();

    const [ selectedExam, setSelectedExam ] = useState();
    const [ questions, setQuestions ] = useState();

    const onChangeRefenceExam = useCallback((exam, questions) => {
        setSelectedExam(exam);
        setQuestions(questions);
    }, [setSelectedExam, setQuestions]);

    const [ duration, setDuration ] = useState(undefined);
    const onDurationChange = useCallback((duration) => {
        setDuration(duration);
    } , [setDuration]);

    const handleSave = useCallback(async () => {
        if(examSession.label.length === 0){
            showSnackbar('You exam session has no label. Please enter a label.', 'error');
            return false;
        }
        let data = {
            phase: ExamSessionPhase.DRAFT,
            label: examSession.label,
            conditions: examSession.conditions,
            duration
        };
        if(selectedExam){
            data.questions = questions;
        }
        await save(data)
        .then(() => {
            showSnackbar('Exam session saved', 'success');
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
        return true;
    }, [examSession, duration, questions, selectedExam, save, showSnackbar]);

    const handleFinalize = useCallback(async () => {
        if(await handleSave()){
            router.push(`/exam-sessions`);
        }
    }, [router, handleSave]);

    return (
        <LayoutMain>
        
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>          
            <RegistrationClipboard sessionId={examSession.id} />
            <StepReferenceExam 
                examSession={examSession} 
                onChange={onChangeRefenceExam}
            />

            <StepGeneralInformation 
                examSession={examSession} 
                onChange={(data)=>{
                    examSession.label = data.label;
                    examSession.conditions = data.conditions;
                }}
            />
            
            <StepSchedule
                examSession={examSession}
                onChange={onDurationChange}
            />
            
            <Stack direction="row" justifyContent="space-between">
                <LoadingButton
                    onClick={handleSave}
                    loading={saving}
                    variant="outlined"
                    color="info"
                >
                    Save
                </LoadingButton>

                <LoadingButton
                    onClick={handleFinalize}
                    loading={saving}
                    variant="contained"
                >
                    Finalize
                </LoadingButton>

            </Stack>
            
        </Stack>
        </LayoutMain>
    )
}

export default PageDraft;