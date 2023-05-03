import { useState, useCallback } from 'react';
import {JamSessionPhase, Role} from '@prisma/client';
import useSWR from 'swr';

import {Stack} from "@mui/material";
import LayoutMain from '../../layout/LayoutMain';
import { useRouter } from 'next/router';
import { useSnackbar } from '../../../context/SnackbarContext';

import StepReferenceJam from '../draft/StepReferenceJam';
import StepGeneralInformation from '../draft/StepGeneralInformation';
import StepSchedule from '../draft/StepSchedule';

import JoinClipboard from '../JoinClipboard';
import { LoadingButton } from '@mui/lab';
import { update, create } from './crud';
import PhaseRedirect from './PhaseRedirect';
import Authorisation from "../../security/Authorisation";
import MainMenu from "../../layout/MainMenu";

const PageDraft = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { show: showSnackbar } = useSnackbar();

    const { data:jamSession } = useSWR(
        `/api/jam-sessions/${jamSessionId}`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        {
            fallbackData: {
                id: undefined,
                label: '',
                conditions: ''
            }
        }
    );

    const [ saving, setSaving ] = useState(false);

    const [ selectedCollection, setSelectedCollection ] = useState(undefined);

    const onChangeReferenceCollection = useCallback((collection) => {
        setSelectedCollection(collection);
    }, [setSelectedCollection]);

    const [ duration, setDuration ] = useState(undefined);
    const onDurationChange = useCallback((duration) => {
        setDuration(duration);
    } , [setDuration]);

    const handleSave = useCallback(async () => {

        setSaving(true);
        let data = {
            phase: JamSessionPhase.DRAFT,
            label: jamSession?.label,
            conditions: jamSession?.conditions,
            collectionId: selectedCollection?.id,
            duration
        };

        if(!selectedCollection){
            showSnackbar('Please select the reference collections.', 'error');
            setSaving(false);
            return false;
        }

        const hasQuestions = selectedCollection.collectionToQuestions && selectedCollection.collectionToQuestions.length > 0;

        if(!hasQuestions){
            showSnackbar('Your jam session has no questions. Please select the reference collection.', 'error');
            setSaving(false);
            return false;
        }

        if(data.label.length === 0){
            showSnackbar('You collections session has no label. Please enter a label.', 'error');
            setSaving(false);
            return false;
        }

        if(jamSession.id){
            await update(jamSession.id, data)
            .then((response) => {
                if(response.ok){
                    showSnackbar('Jam session saved', 'success');
                }else{
                    response.json().then((data) => {
                        showSnackbar(data.message, 'error');
                    });
                }
            }).catch(() => {
                showSnackbar('Error while saving jam session', 'error');
            });
        } else {
            await create(data)
            .then((response) => {
                if(response.ok){
                    response.json().then(async (data) => {
                        await router.push(`/jam-sessions/${data.id}/draft`);
                    });
                }else{
                    response.json().then((data) => {
                        showSnackbar(data.message, 'error');
                    });
                }
            }).catch(() => {
                showSnackbar('Error while saving collections session', 'error');
            });
        }
        setSaving(false);
        return true;
    }, [jamSession, selectedCollection, duration, showSnackbar, router]);

    const handleFinalize = useCallback(async () => {
        if(await handleSave()){
            await router.push(`/jam-sessions`);
        }
    }, [router, handleSave]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={jamSession?.phase}>
            <LayoutMain header={ <MainMenu /> } padding={2}>
                { jamSession && (
                    <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
                    { jamSession.id && (
                        <JoinClipboard jamSessionId={jamSession.id} />
                    )}

                    <StepReferenceJam
                        jamSession={jamSession}
                        onChange={onChangeReferenceCollection}
                    />

                    <StepGeneralInformation
                        jamSession={jamSession}
                        onChange={(data)=>{
                            jamSession.label = data.label;
                            jamSession.conditions = data.conditions;
                        }}
                    />

                    <StepSchedule
                        jamSession={jamSession}
                        onChange={onDurationChange}
                    />

                    <Stack direction="row" justifyContent="space-between">
                        <LoadingButton
                            onClick={handleSave}
                            loading={saving}
                            variant="outlined"
                            color="info"
                        >
                            { jamSession.id ? 'Save' : 'Create' }
                        </LoadingButton>
                        { jamSession.id && (
                            <LoadingButton
                                onClick={handleFinalize}
                                loading={saving}
                                variant="contained"
                            >
                                Finalize
                            </LoadingButton>
                        )}
                    </Stack>
                </Stack>
                )}
            </LayoutMain>
        </PhaseRedirect>
        </Authorisation>
    )
}

export default PageDraft;