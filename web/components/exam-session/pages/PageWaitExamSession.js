import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ExamSessionPhase } from '@prisma/client';

import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";
import LoginGitHub from '../../layout/LoginGitHub';

const PageWaitExamSession = () => {
    const router = useRouter();
    const { status } = useSession();
    
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
    console.log(examSession, status);
    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    
    return <>            
            { status === 'loading' && <LoadingAnimation /> }
            { status === 'unauthenticated' && <LoginGitHub /> }
            { status === 'authenticated' 
                && examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS && (
                    <LoadingAnimation text={examSession.label ? `${examSession.label} is not in progress.` : 'This exam session is not in progress.'} />
                )
            }
    </>
}


export default PageWaitExamSession;