import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';

const phasePageRelationship = {
    'NEW' : '/sessions/new',
    'DRAFT': '/sessions/[sessionId]/draft',
    'IN_PROGRESS': '/sessions/[sessionId]/in-progress',
    'GRADING': '/sessions/[sessionId]/grading/[activeQuestion]',
    'FINISHED': '/sessions/[sessionId]/finished',
};

const redirectToPhasePage = (phase, router) => {
    if(router.pathname === phasePageRelationship[phase]) return;
    switch(phase){
        case ExamSessionPhase.NEW:
            router.push(`/exam-sessions/new`);
            return;
        case ExamSessionPhase.DRAFT:
            router.push(`/exam-sessions/${router.query.sessionId}/draft`);
            return;
        case ExamSessionPhase.IN_PROGRESS:
            router.push(`/exam-sessions/${router.query.sessionId}/in-progress`);
            return;
        case ExamSessionPhase.GRADING:
            router.push(`/exam-sessions/${router.query.sessionId}/grading/1`);
            return;
        case ExamSessionPhase.FINISHED:
            router.push(`/exam-sessions/${router.query.sessionId}/finished`);
            return;
    }
}

const PhaseRedirect = ({ phase, children }) => {
    const router = useRouter();
    redirectToPhasePage(phase, router);

    return children;
}

export default PhaseRedirect;
