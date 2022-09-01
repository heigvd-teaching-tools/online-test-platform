import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingAnimation from "../../../components/layout/LoadingAnimation";

const JoinExamSession = () => {
    const { query: { sessionId }} = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if(sessionId && session){
            fetch(`/api/exam-sessions/${sessionId}/register`, {
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
            });
        }
    }, [sessionId, session]);


    return <LoadingAnimation />

}

export default JoinExamSession;