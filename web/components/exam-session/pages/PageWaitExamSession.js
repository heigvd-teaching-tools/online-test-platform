import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { ExamSessionPhase } from '@prisma/client';

import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";

const PageWaitExamSession = () => {
    const router = useRouter();
    
    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { refreshInterval  : 1000 }
    );
    
    useEffect(() => {
        if(examSession && examSession.phase === ExamSessionPhase.IN_PROGRESS){
            router.push(`/exam-sessions/${router.query.sessionId}/take/1`);
        }
    }, [examSession, router]);

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        let text = examSession.label ? `${examSession.label} is not in progress.` : 'This exam session is not in progress.';
        return <LoadingAnimation text={text} />;       
    } 
}


export default PageWaitExamSession;