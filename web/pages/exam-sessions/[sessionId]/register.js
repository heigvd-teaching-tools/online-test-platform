import {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingAnimation from "../../../components/feedback/LoadingAnimation";

const JoinExamSession = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [ error, setError ] = useState(null);
    useEffect(() => {
        setError(null);
        if(router.query.sessionId && session && status === 'authenticated') {
            (async () => {
                await fetch(`/api/exam-sessions/${router.query.sessionId}/register`, {
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
                    await router.push(`/exam-sessions/${router.query.sessionId}/waiting`);
                }).catch(err => setError(err.message));
            })();
        }
    }, [router, session, status]);

    return <LoadingAnimation content={error || "registering..."} failed={error} />
}

export default JoinExamSession;