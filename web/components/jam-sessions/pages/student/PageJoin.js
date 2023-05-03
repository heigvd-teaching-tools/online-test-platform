import {useRouter} from "next/router";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import LoadingAnimation from "../../../feedback/LoadingAnimation";
/*
*    Used as entry point for students
*    Sends a join request to the server and redirects to the waiting page
*  */
const PageJoin = () => {
    const router = useRouter();
    const { jamSessionId } = router.query;

    const { data: session, status } = useSession();
    const [ error, setError ] = useState(null);
    useEffect(() => {
        setError(null);
        if(jamSessionId && session && status === 'authenticated') {
            (async () => {
                await fetch(`/api/jam-sessions/${jamSessionId}/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        studentEmail: session.user.email
                    })
                })
                    .then(async (res) => {
                        let data = await res.json();
                        if(!res.ok) {
                            throw new Error(data.message);
                        }
                        return data;
                    })
                    .then(async () => {
                        setError(null);
                        await router.push(`/jam-sessions/${jamSessionId}/wait`);
                    }).catch(err => setError(err.message));
            })();
        }
    }, [jamSessionId, router, session, status]);

    return <LoadingAnimation content={error || "joining..."} failed={error} />
}

export default PageJoin;