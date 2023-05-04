import {Role, JamSessionPhase} from "@prisma/client";
import {useRouter} from "next/router";
import LoadingAnimation from "../../../feedback/LoadingAnimation";
import Authentication from "../../../security/Authentication";
import Authorisation from "../../../security/Authorisation";
import useSWR from "swr";
import {useEffect, useState} from "react";
import {phaseGT, redirectToPhasePage} from "../../../../code/phase";
import {fetcher} from "../../../../utils/fetcher";

const PageDispatch = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { data, error:dispatchError, status, mutate } = useSWR(
        `/api/jam-sessions/${jamSessionId}/dispatch`,
        jamSessionId ? fetcher : null,
    );

    const [ message, setMessage ] = useState("Redirecting...");
    const [ error, setError ] = useState(false);

    useEffect(() => {
        if(dispatchError){
            setMessage(dispatchError.message);
            setError(false);
        }
    }, [dispatchError]);

    useEffect(() => {
        if(data && !error){
            const { jamSession, userOnJamSession } = data;
            console.log("data: ", data);
            console.log("phase: ", jamSession.phase);
            console.log("userOnJamSession: ", userOnJamSession);
            if(!userOnJamSession){ // the user is not yet on the jam session
                // check if the current phase of the JamSession allow the user to join

                if(!phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)){

                    setMessage("Joining the jam session...");
                    setError(false);
                    console.log("Joining the jam session...");
                    (async () => {
                        await router.push(`/jam-sessions/${jamSessionId}/join`);
                    })();
                    return;
                }else{
                    console.log("Too late to join")
                    setMessage("Too late to join");
                    setError(true);
                    return;
                }
            }else{
                console.log("Redirecting to phase page")
                redirectToPhasePage(jamSessionId, jamSession.phase, router);
            }
        }
    }, [data, error]);

    return(
        <Authentication >
            <Authorisation allowRoles={[Role.STUDENT, Role.PROFESSOR]}>
                <LoadingAnimation content={message} failed={error} />
            </Authorisation>
        </Authentication>
    )

}

export default PageDispatch;
