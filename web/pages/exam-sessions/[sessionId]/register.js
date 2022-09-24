import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Authentication from '../../../components/layout/Authentication';

const JoinExamSession = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if(router.query.sessionId && session && status === 'authenticated') {
            fetch(`/api/exam-sessions/${router.query.sessionId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    studentEmail: session.user.email
                })
            })
            .then(res => res.json())
            .then(_ => {
                router.push(`/exam-sessions/${router.query.sessionId}/waiting`);
            });
        }
    }, [router, session, status]);

    return <></>
}

export default JoinExamSession;