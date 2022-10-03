import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';
import LoadingAnimation from '../components/feedback/LoadingAnimation';
import { useSnackbar } from './SnackbarContext';

const ExamSessionContext = createContext();

export const useExamSession = () => useContext(ExamSessionContext);

const phasePageRelationship = {
    'DRAFT': '/exam-sessions/[sessionId]/draft/[activeStep]',
    'IN_PROGRESS': '/exam-sessions/[sessionId]/in-progress/[activeStep]',
    'GRADING': '/exam-sessions/[sessionId]/grading/[activeQuestion]',
    'FINISHED': '/exam-sessions/[sessionId]/finished',
};

const redirectToPhasePage = (phase, router) => {
    if(router.pathname === phasePageRelationship[phase]) return;
    switch(phase){
        case ExamSessionPhase.DRAFT:
            router.push(`/exam-sessions/${router.query.sessionId}/draft/1`);
            return;
        case ExamSessionPhase.IN_PROGRESS:
            router.push(`/exam-sessions/${router.query.sessionId}/in-progress/1`);
            return;
        case ExamSessionPhase.GRADING:
            router.push(`/exam-sessions/${router.query.sessionId}/grading/1`);
            return;
        case ExamSessionPhase.FINISHED:
            router.push(`/exam-sessions/${router.query.sessionId}/finished`);
            return;
    }
}

export const ExamSessionProvider = ({ children }) => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { data:examSession, errorSession, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (examSession) {
            redirectToPhasePage(examSession.phase, router);
        }
    }, [examSession, router]);

    const save = useCallback(async (data) => {
        setSaving(true);
        return fetch(`/api/exam-sessions/${router.query.sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then((res) => {
            if(res.ok){
                return res.json();
            }else{
                res.json().then((data) => {
                    showSnackbar(data.message, 'error');
                });
            }
        })
        .then((updatedExamSession) => {
            if(data.phase){
                redirectToPhasePage(data.phase, router);            
            }
            mutate(updatedExamSession);
            setSaving(false);
        })
        .catch(() => {
            setSaving(false);
        });
       
    }, [router, mutate, showSnackbar]);
    
    if (errorSession) return <div>failed to load</div>
    if (!examSession) return <LoadingAnimation /> 

    return (
        <>
            {examSession && (
                <ExamSessionContext.Provider value={{ 
                    examSession, 
                    saving,
                    save,  
                }}>
                        {children}
                </ExamSessionContext.Provider>
            )}
            
        </>
    );
}
