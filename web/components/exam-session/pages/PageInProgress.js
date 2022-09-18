import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Stack, Stepper, Step, StepLabel } from '@mui/material';
import RegistrationClipboard from '../RegistrationClipboard';
import StepNav from '../StepNav';

import { useExamSession } from '../../../context/ExamSessionContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import StepInProgress from '../in-progress/StepInProgress';
import LayoutMain from '../../layout/LayoutMain';

const PageInProgress = () => {
    const router = useRouter();
    const { examSession, activeStep, save, saving} = useExamSession();
    const { show: showSnackbar } = useSnackbar();

    const handleFinalStep = () => {
    }

    const handleDurationChange = useCallback((newEndAt) => {
        // get time from newEndAt date
        const time = new Date(newEndAt).toLocaleTimeString();
        save({
            endAt: newEndAt
        }).then(() => {
            showSnackbar(`Exam session will end at ${time}`);
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
    }, [save, showSnackbar]);
    
    return(
        <LayoutMain>
            <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
            <RegistrationClipboard sessionId={router.query.sessionId} />        
            <Stepper activeStep={activeStep} orientation="vertical">
                <Step key="in-progress">
                    <StepInProgress 
                        examSession={examSession}
                        onDurationChange={handleDurationChange}
                        onSessionEnd={() => {}}
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
                saveRunning={saving} 
                onFinalStep={handleFinalStep}
            />
            </Stack>
        </LayoutMain>
    )
}


export default PageInProgress;