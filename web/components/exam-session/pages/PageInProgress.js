import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Stack, Stepper, Step, StepLabel, Typography } from '@mui/material';

import { ExamSessionPhase } from '@prisma/client';

import { useExamSession } from '../../../context/ExamSessionContext';
import { useSnackbar } from '../../../context/SnackbarContext';

import RegistrationClipboard from '../RegistrationClipboard';
import StepInProgress from '../in-progress/StepInProgress';
import LayoutMain from '../../layout/LayoutMain';
import { LoadingButton } from '@mui/lab';

import DisplayPhase from '../DisplayPhase';
import DialogFeedback from '../../feedback/DialogFeedback';

const PageInProgress = () => {
    const router = useRouter();

    const [ endSessionDialogOpen, setEndSessionDialogOpen ] = useState(false);

    const { examSession, activeStep, save, saving} = useExamSession();
    const { show: showSnackbar } = useSnackbar();

    const handleEndInProgress = () => {
        setEndSessionDialogOpen(true);
    }

    const moveToGradingPhase = useCallback(async () => {
        await save({
            phase: ExamSessionPhase.GRADING
        }).then(() => {
            router.push(`/exam-sessions/${examSession.id}/grading/0`);
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
    }, [examSession, save, router, showSnackbar]);

    const handleDurationChange = useCallback((newEndAt) => {
        // get time from newEndAt date
        const time = new Date(newEndAt).toLocaleTimeString();
        save({
            endAt: newEndAt
        }).then(() => {
            showSnackbar(`Exam session will end at ${time}`);
        }).catch(() => {
            showSnackbar('Error during duration change', 'error');
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
                <Step key="grading">
                    <StepLabel>Grading</StepLabel>
                </Step>
            </Stepper>

            <Stack direction="row" justifyContent="center" spacing={1}>
                <DisplayPhase phase={ExamSessionPhase.IN_PROGRESS} />

                <LoadingButton
                    key="promote-to-grading"
                    onClick={handleEndInProgress}
                    loading={saving}
                    color="info"
                    startIcon={<Image alt="Promote" src="/svg/exam/finish-flag.svg" layout="fixed" width="18" height="18" />}
                >
                    End session
                </LoadingButton>

            </Stack>
            </Stack>
            <DialogFeedback 
                open={endSessionDialogOpen}
                title="End of In-Progress phase"
                content={
                <>
                    <Typography variant="body1">You are about to promote this session to the grading phase.</Typography>
                    <Typography variant="body1">Students will not be able to submit their answers anymore.</Typography>
                    <Typography variant="button" gutterBottom>Are you sure you want to continue?</Typography>
                </>
                }
                onClose={() => setEndSessionDialogOpen(false)}
                onConfirm={moveToGradingPhase}
            />
        </LayoutMain>
    )
}


export default PageInProgress;