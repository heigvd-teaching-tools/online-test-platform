import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {JamSessionPhase, Role} from '@prisma/client';

import LoadingAnimation from "../../../feedback/LoadingAnimation";
import { Button, Typography } from "@mui/material";
import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";

const phaseToPhrase = (phase) => {
    switch(phase){
        case JamSessionPhase.NEW:
        case JamSessionPhase.DRAFT:
            return 'not is progress';
        case JamSessionPhase.IN_PROGRESS:
            return 'in progress';
        case JamSessionPhase.GRADING:
            return 'being graded';
        case JamSessionPhase.FINISHED:
            return 'finished';
        default:
            return 'unknown';
    }
}

const PageWaiting = () => {
    const router = useRouter();
    const jamSessionId = router.query.jamSessionId;

    const { data } = useSession();


    const { data: jamSession, errorSession, error  } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/take`,
        data && jamSessionId ?
            (...args) =>
                fetch(...args)
                .then((res) => {
                    if(!res.ok){
                        switch(res.status){
                            case 403:
                                throw new Error('You are not allowed to access this jam session');
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
        if(jamSession && jamSession.phase === JamSessionPhase.IN_PROGRESS){
            router.push(`/jam-sessions/${jamSessionId}/take/1`);
        }
    }, [jamSession, router, jamSessionId]);

    if(error) return <LoadingAnimation failed={true}  content={error.message} />
    if (errorSession) return <LoadingAnimation failed={true} message={errorSession.message} />;
    if (!jamSession) return <LoadingAnimation />

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>{
        jamSession && jamSession.phase !== JamSessionPhase.IN_PROGRESS && (
            <StudentPhaseRedirect phase={jamSession.phase}>
                <LoadingAnimation content={
                    <>
                    <Typography variant="body1" gutterBottom>
                        {jamSession.label ? `${jamSession.label} is ${phaseToPhrase(jamSession.phase)}.` : 'This collections session is not in progress.'}
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
