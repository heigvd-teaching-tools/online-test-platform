import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';
import LoadingAnimation from '../components/feedback/LoadingAnimation';
import { useSnackbar } from './SnackbarContext';

const ExamSessionContext = createContext();

export const useExamSession = () => useContext(ExamSessionContext);

export const ExamSessionProvider = ({ children }) => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const { data:examSession, errorSession, mutate } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [saving, setSaving] = useState(false);

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
    return (
        <>
            <ExamSessionContext.Provider value={{ 
                examSession, 
                saving,
                save,  
            }}>
                    {children}
            </ExamSessionContext.Provider>
        </>
    );
}
