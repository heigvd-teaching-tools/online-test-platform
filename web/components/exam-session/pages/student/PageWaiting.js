import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {ExamSessionPhase, Role} from '@prisma/client';

import AlertFeedback from "../../../feedback/AlertFeedback";
import LoadingAnimation from "../../../feedback/LoadingAnimation";
import { Button, Typography } from "@mui/material";
import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";

const phaseToPhrase = (phase) => {
    switch(phase){
        case ExamSessionPhase.NEW:
        case ExamSessionPhase.DRAFT:
            return 'not is progress';
        case ExamSessionPhase.IN_PROGRESS:
            return 'in progress';
        case ExamSessionPhase.GRADING:
            return 'being graded';
        case ExamSessionPhase.FINISHED:
            return 'finished';
        default:
            return 'unknown';
    }
}

const PageWaiting = () => {
    const router = useRouter();
    const { data } = useSession();
    
    const { data: examSession, errorSession, error  } = useSWR(
        `/api/users/exam-sessions/${router.query.sessionId}/take`,
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
    
    if(error) return <LoadingAnimation failed={true}  content={error.message} />
    if (errorSession) return <LoadingAnimation failed={true} message={errorSession.message} />;
    if (!examSession) return <LoadingAnimation /> 
    
    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>{
        examSession && examSession.phase !== ExamSessionPhase.IN_PROGRESS && (
            <StudentPhaseRedirect phase={examSession.phase}>
                <LoadingAnimation content={
                    <>
                    <Typography variant="body1" gutterBottom>
                        {examSession.label ? `${examSession.label} is ${phaseToPhrase(examSession.phase)}.` : 'This exam session is not in progress.'}
                    </Typography>
                    <Button onClick={() => signOut()}>Sign out</Button>
                    </>
                } />
            </StudentPhaseRedirect>
        )}
        </Authorisation>
    )
}

export default PageWaiting;