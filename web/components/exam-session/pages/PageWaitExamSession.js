import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { ExamSessionPhase } from '@prisma/client';

import AlertFeedback from "../../feedback/AlertFeedback";
import LoadingAnimation from "../../feedback/LoadingAnimation";
import { Button, Typography } from "@mui/material";
import Authentication from "../../layout/Authentication";

const PageWaitExamSession = () => {
    const router = useRouter();
    const { data } = useSession();
    
    const { data: examSession, errorSession, error  } = useSWR(
        `/api/users/${data && data.user.email}/exam-sessions/${router.query.sessionId}`,
        data && router.query.sessionId ? 
            (...args) => 
                fetch(...args)
                .then((res) => {
                    if(!res.ok){
                        switch(res.status){
                            case 403:
                                throw new Error('You are not allowed to access this exam session');
                            default:
                                throw new Error('An error occurred while fetching the data.');
                        }
                    }
                    return res.json();
                }) 
            : null,
        { refreshInterval  : 1000 }
    );
    
    useEffect(() => {
        if(examSession && examSession.phase === ExamSessionPhase.IN_PROGRESS){
            router.push(`/exam-sessions/${router.query.sessionId}/take/1`);
        }
    }, [examSession, router]);
    
    if(error) return <LoadingAnimation content={error.message} />      
    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    
    return (
    <Authentication>
        {examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS && (
            <LoadingAnimation content={
                <>
                <Typography variant="body1" gutterBottom>
                    {examSession.label ? `${examSession.label} is not in progress.` : 'This exam session is not in progress.'}
                </Typography>
                <Button onClick={() => signOut()}>Sign out</Button>
                </>
            } />
        )
    }
    </Authentication>
    )
}


export default PageWaitExamSession;