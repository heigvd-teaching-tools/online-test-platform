import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';
import LoadingAnimation from '../components/layout/LoadingAnimation';

const ExamSessionContext = createContext();
export const useExamSession = () => useContext(ExamSessionContext);

// phase / number of steps relationship
const phaseSteps = {
    'DRAFT': 2,
    'SCHEDULING': 1,
    'IN_PROGRESS': 1,
    'CORRECTION': 1,
    'FINISHED': 1,
};

const phasePageRelationship = {
    'DRAFT': '/exam-sessions/[sessionId]',
    'SCHEDULING': '/exam-sessions/[sessionId]/scheduling',
    'IN_PROGRESS': '/exam-sessions/[sessionId]/in-progress',
    'CORRECTION': '/exam-sessions/[sessionId]/correction',
    'FINISHED': '/exam-sessions/[sessionId]/finished',
};

const redirectToPhasePage = (phase, router) => {
    if(router.pathname === phasePageRelationship[phase]) return;
    switch(phase){
        case ExamSessionPhase.DRAFT:
            router.push(`/exam-sessions/${router.query.sessionId}`);
            return;
        case ExamSessionPhase.SCHEDULING:
            router.push(`/exam-sessions/${router.query.sessionId}/scheduling`);
            return;
        case ExamSessionPhase.IN_PROGRESS:
            router.push(`/exam-sessions/${router.query.sessionId}/in-progress`);
            return;
        case ExamSessionPhase.CORRECTION:
            router.push(`/exam-sessions/${router.query.sessionId}/correction`);
            return;
        case ExamSessionPhase.FINISHED:
            router.push(`/exam-sessions/${router.query.sessionId}/finished`);
            return;
    }
}

export const ExamSessionProvider = ({ children }) => {
    const router = useRouter();
    const { data, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [examSession, setExamSession] = useState();
    const [activeStep, setActiveStep] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setExamSession(data);
            redirectToPhasePage(data.phase, router);
        }
    }, [data, router]);

    const stepBack = useCallback(() => {
        if(activeStep > 0){
            setActiveStep(activeStep - 1);
            return true;
        }
        return false;
    }, [activeStep]);

    const stepNext = useCallback(() => {
        if(activeStep < phaseSteps[examSession.phase]){
            setActiveStep(activeStep + 1);
            return true;
        }
        return false;
    }, [activeStep, examSession]);

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
        .then((res) => res.json())
        .then((updatedExamSession) => {
            if(data.phase){
                redirectToPhasePage(data.phase, router);            
            }
            setExamSession({
                ...examSession,
                ...updatedExamSession
            });
            setSaving(false);
        })
        .catch(() => {
            setSaving(false);
        });
       
    }, [router, setExamSession, examSession]);
    
    if (errorSession) return <div>failed to load</div>
    if (!examSession) return <LoadingAnimation /> 

    return (
        <>
            {examSession && (
                <ExamSessionContext.Provider value={{ 
                    examSession, 
                    activeStep, 
                    stepBack, 
                    stepNext,
                    saving,
                    save,  
                }}>
                        {children}
                </ExamSessionContext.Provider>
            )}
            
        </>
    );
}
