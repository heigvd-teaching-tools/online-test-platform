import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {JamSessionPhase, Role} from '@prisma/client';

import LoadingAnimation from "../../../feedback/LoadingAnimation";
import { Button, Typography } from "@mui/material";
import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import {fetcher} from "../../../../utils/fetcher";

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

    const { data, errorSession, error  } = useSWR(
        `/api/jam-sessions/${jamSessionId}/dispatch`,
        jamSessionId ? fetcher : null,
        { refreshInterval  : 1000 }
    );

    useEffect(() => {
        if(data?.jamSession && data.jamSession.phase === JamSessionPhase.IN_PROGRESS){
            router.push(`/jam-sessions/${jamSessionId}/take/1`);
        }
    }, [data, router, jamSessionId]);

    if(error) return <LoadingAnimation failed={error.isGeneric}  content={error.message} />
    if (errorSession) return <LoadingAnimation failed={true} message={errorSession.message} />;
    if (!data?.jamSession) return <LoadingAnimation />

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>{
            data?.jamSession && data.jamSession.phase !== JamSessionPhase.IN_PROGRESS && (
            <StudentPhaseRedirect phase={data.jamSession.phase}>
                <LoadingAnimation content={
                    <>
                    <Typography variant="body1" gutterBottom>
                        {data.jamSession.label ? `${data.jamSession.label} is ${phaseToPhrase(data.jamSession.phase)}.` : 'This session is not in progress.'}
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
