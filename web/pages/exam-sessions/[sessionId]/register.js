import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingAnimation from "../../../components/layout/LoadingAnimation";

const JoinExamSession = () => {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if(router.query.sessionId && session){
            console.log("session", session);
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
            .then(res => {
                console.log(res);
                router.push(`/exam-sessions/${router.query.sessionId}/take`);
            });
        }
    }, [router, session]);


    return <LoadingAnimation />

}

export default JoinExamSession;