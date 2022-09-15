import { useState, useCallback, useEffect } from 'react';
import { ExamSessionPhase } from '@prisma/client';

import { Step, Stack  } from "@mui/material";
import MainLayout from '../../layout/MainLayout';
import { useRouter } from 'next/router';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useExamSession } from '../../../context/ExamSessionContext';

import StepGeneralInformation from '../draft/StepGeneralInformation';
import StepSchedule from '../draft/StepSchedule';

import RegistrationClipboard from '../RegistrationClipboard';
import { LoadingButton } from '@mui/lab';

const PageDraft = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { examSession, save, saving} = useExamSession();

    const [ duration, setDuration ] = useState(undefined);
    const onDurationChange = useCallback((duration) => {
        setDuration(duration);
    } , [setDuration]);

    const handleSave = useCallback(async () => {
        if(examSession.label.length === 0){
            showSnackbar('You exam session has no label. Please enter a label.', 'error');
            return;
        }
        await save({
            phase: ExamSessionPhase.DRAFT,
            label: examSession.label,
            conditions: examSession.conditions,
            duration
        }).then(() => {
            showSnackbar('Exam session saved', 'success');
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
    }, [examSession, duration, save, showSnackbar]);

    const handleFinalize = useCallback(async () => {
        await handleSave();
        router.push(`/exam-sessions`);
    }, [router, handleSave]);

    return (
        <MainLayout>
        
        <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>          
            <RegistrationClipboard sessionId={examSession.id} />
            
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
        </MainLayout>
    )
}

export default PageDraft;