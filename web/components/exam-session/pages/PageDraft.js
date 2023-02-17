import { useState, useCallback } from 'react';
import {ExamSessionPhase, Role} from '@prisma/client';
import useSWR from 'swr';

import { Stack  } from "@mui/material";
import LayoutMain from '../../layout/LayoutMain';
import { useRouter } from 'next/router';
import { useSnackbar } from '../../../context/SnackbarContext';

import StepReferenceExam from '../draft/StepReferenceExam';
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
    const { show: showSnackbar } = useSnackbar();

    const { data:examSession, errorSession, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        {
            fallbackData: {
                id: undefined,
                label: '',
                conditions: ''
            }
        }
    );

    const [ saving, setSaving ] = useState(false);

    const [ questions, setQuestions ] = useState();

    const onChangeRefenceExam = useCallback((_, questions) => {
        setQuestions(questions);
    }, [setQuestions]);

    const [ duration, setDuration ] = useState(undefined);
    const onDurationChange = useCallback((duration) => {
        setDuration(duration);
    } , [setDuration]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        let data = {
            phase: ExamSessionPhase.DRAFT,
            label: examSession.label,
            conditions: examSession.conditions,
            questions,
            duration
        };

        if(!data.questions || data.questions && data.questions.length === 0){
            showSnackbar('You exam session has no questions. Please select the reference exam.', 'error');
            setSaving(false);
            return false;
        }

        if(data.label.length === 0){
            showSnackbar('You exam session has no label. Please enter a label.', 'error');
            setSaving(false);
            return false;
        }

        if(router.query.sessionId){
            await update(router.query.sessionId, data)
            .then((response) => {
                if(response.ok){
                    showSnackbar('Exam session saved', 'success');
                }else{
                    response.json().then((data) => {
                        showSnackbar(data.message, 'error');
                    });
                }
            }).catch(() => {
                showSnackbar('Error while saving exam session', 'error');
            });
        } else {
            await create(data)
            .then((response) => {
                if(response.ok){
                    response.json().then(async (data) => {
                        await router.push(`/exam-sessions/${data.id}/draft`);
                    });
                }else{
                    response.json().then((data) => {
                        showSnackbar(data.message, 'error');
                    });
                }
            }).catch(() => {
                showSnackbar('Error while saving exam session', 'error');
            });
        }
        setSaving(false);
        return true;
    }, [examSession, duration, questions, showSnackbar, router]);

    const handleFinalize = useCallback(async () => {
        if(await handleSave()){
            await router.push(`/exam-sessions`);
        }
    }, [router, handleSave]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
        <PhaseRedirect phase={examSession?.phase}>
            <LayoutMain header={ <MainMenu /> }>
                { examSession && (
                    <Stack sx={{ width:'100%' }}  spacing={4} pb={40}>
                    { examSession.id && (
                        <JoinClipboard sessionId={examSession.id} />
                    )}

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
                            { examSession.id ? 'Save' : 'Create' }
                        </LoadingButton>
                        { examSession.id && (
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
