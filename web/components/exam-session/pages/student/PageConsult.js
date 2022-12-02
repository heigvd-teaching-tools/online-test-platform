import { useRouter } from "next/router";

const PageConsult = () => {
    const router = useRouter();
    const { sessionId } = router.query;

    return (
        <div>
        <h1>Consult exam session {sessionId}</h1>
        </div>
    );
}

export default PageConsult;