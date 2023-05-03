import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import {JamSessionPhase, Role} from '@prisma/client';
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
import MainMenu from "../../layout/MainMenu";

const PageInProgress = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { show: showSnackbar } = useSnackbar();

    const [ endSessionDialogOpen, setEndSessionDialogOpen ] = useState(false);

    const { data:jamSession, mutate } = useSWR(
        `/api/jam-sessions/${jamSessionId}`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ saving, setSaving ] = useState(false);

    const handleEndInProgress = () => {
        setEndSessionDialogOpen(true);
    }

    const moveToGradingPhase = useCallback(async () => {
        setSaving(true);
        await update(jamSession.id, {
            phase: JamSessionPhase.GRADING
        }).then(async () => {
            await router.push(`/jam-sessions/${jamSession.id}/grading/1`);
        }).catch(() => {
            showSnackbar('Error', 'error');
        });
        setSaving(false);
    }, [jamSession, router, showSnackbar]);

    const handleDurationChange = useCallback(async (newEndAt) => {
        // get time from newEndAt date
        const time = new Date(newEndAt).toLocaleTimeString();
        setSaving(true);
        await update(jamSession.id, {
            endAt: newEndAt
        }).then(async (reponse) => {
            if(reponse.ok){
                mutate(await reponse.json(), false);
                showSnackbar(`Jam session will end at ${time}`);
            }else{
                reponse.json().then((json) => {
                    showSnackbar(json.message, 'error');
                });
            }
        }).catch(() => {
            showSnackbar('Error during duration change', 'error');
        });
        setSaving(false);
    }, [jamSession, showSnackbar, mutate]);

    return(
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={jamSession?.phase}>
            {jamSession && (
                <LayoutMain
                    header={ <MainMenu /> }
                    padding={2}
                    spacing={2}
                >
                    <JoinClipboard jamSessionId={jamSessionId} />
                    <Stepper activeStep={0} orientation="vertical">
                        <Step key="in-progress">
                            <StepInProgress
                                jamSession={jamSession}
                                onDurationChange={handleDurationChange}
                                onJamSessionEnd={() => {}}
                            />
                        </Step>
                        <Step key="grading">
                            <StepLabel>Grading</StepLabel>
                        </Step>
                    </Stepper>

                    <Stack direction="row" justifyContent="center" spacing={1}>
                        <DisplayPhase phase={JamSessionPhase.IN_PROGRESS} />

                        <LoadingButton
                            key="promote-to-grading"
                            onClick={handleEndInProgress}
                            loading={saving}
                            color="info"
                            startIcon={<Image alt="Promote" src="/svg/icons/finish.svg" layout="fixed" width="18" height="18" />}
                        >
                            End jam session
                        </LoadingButton>

                    </Stack>
                    <DialogFeedback
                        open={endSessionDialogOpen}
                        title="End of In-Progress phase"
                        content={
                        <>
                            <Typography variant="body1">You are about to promote this jam session to the grading phase.</Typography>
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