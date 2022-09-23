import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';
import LoadingAnimation from '../components/feedback/LoadingAnimation';

const ExamSessionContext = createContext();
export const useExamSession = () => useContext(ExamSessionContext);

// phase / number of steps relationship
const phaseSteps = {
    'DRAFT': {
        page:'draft',
        steps:2,
        defaultStep:1
    },
    'IN_PROGRESS': {
        page:'in-progress',
        steps:1,
        defaultStep:1
    },
    'GRADING': {
        page:'grading',
        steps:1,
        defaultStep:1
    },
    'FINISHED': {
        page:'finished',
        steps:1,
        defaultStep:1
    },
};

const phasePageRelationship = {
    'DRAFT': '/exam-sessions/[sessionId]/draft/[activeStep]',
    'IN_PROGRESS': '/exam-sessions/[sessionId]/in-progress/[activeStep]',
    'GRADING': '/exam-sessions/[sessionId]/grading/[activeStep]',
    'FINISHED': '/exam-sessions/[sessionId]/finished/[activeStep]',
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
            router.push(`/exam-sessions/${router.query.sessionId}/finished/1`);
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
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setExamSession(data);
            redirectToPhasePage(data.phase, router);
        }
    }, [data, router]);

    const stepBack = useCallback(() => {
        let activeStep = parseInt(router.query.activeStep);
        if(router.query.activeStep > 1){
            router.push(`/exam-sessions/${router.query.sessionId}/${phaseSteps[examSession.phase].page}/${activeStep - 1}`);
            return true;
        }
        return false;
    }, [router]);

    const stepNext = useCallback(() => {
        let activeStep = parseInt(router.query.activeStep);
        if(router.query.activeStep <= phaseSteps[examSession.phase].steps){
            router.push(`/exam-sessions/${router.query.sessionId}/${phaseSteps[examSession.phase].page}/${activeStep + 1}`);
            return true;
        }
        return false;
    }, [router, examSession]);

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
                    activeStep: parseInt(router.query.activeStep) - 1, 
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
