import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import {ExamSessionPhase, Role} from '@prisma/client';
import { update } from './crud';

import { Stack, Stepper, Step, StepLabel, Typography } from '@mui/material';

import { useSnackbar } from '../../../context/SnackbarContext';

import JoinClipboard from '../JoinClipboard';
import StepInProgress from '../in-progress/StepInProgress';
import LayoutMain from '../../layout/LayoutMain';
import { LoadingButton } from '@mui/lab';

import DisplayPhase from '../DisplayPhase';
import DialogFeedback from '../../feedback/DialogFeedback';
import PhaseRedirect from './PhaseRedirect';
import Authorisation from "../../security/Authorisation";

const PageInProgress = () => {
    const router = useRouter();

    const [ endSessionDialogOpen, setEndSessionDialogOpen ] = useState(false);

    const { data:examSession, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ saving, setSaving ] = useState(false);

    const { show: showSnackbar } = useSnackbar();

    const handleEndInProgress = () => {
        setEndSessionDialogOpen(true);
    }

    const moveToGradingPhase = useCallback(async () => {
        setSaving(true);
        await update(examSession.id, {
            phase: ExamSessionPhase.GRADING
        }).then(() => {
            router.push(`/exam-sessions/${examSession.id}/grading/1`);
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
        setSaving(false);
    }, [examSession, router, showSnackbar]);

    const handleDurationChange = useCallback(async (newEndAt) => {
        // get time from newEndAt date
        const time = new Date(newEndAt).toLocaleTimeString();
        setSaving(true);
        await update(examSession.id, {
            endAt: newEndAt
        }).then(async (reponse) => {
            if(reponse.ok){
                mutate(await reponse.json(), false);
                showSnackbar(`Exam session will end at ${time}`);
            }else{
                reponse.json().then((json) => {
                    showSnackbar(json.message, 'error');
                });
            }
        }).catch(() => {
            showSnackbar('Error during duration change', 'error');
        });
        setSaving(false);
    }, [examSession, showSnackbar, mutate]);
    
    return(
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={examSession?.phase}>
            {examSession && (
                <LayoutMain>
                <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
                <JoinClipboard sessionId={router.query.sessionId} />
                <Stepper activeStep={0} orientation="vertical">
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
        )}
        </PhaseRedirect>
        </Authorisation>
    )
}


export default PageInProgress;