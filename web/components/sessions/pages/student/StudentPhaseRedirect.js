import { useRouter } from 'next/router';
import { ExamSessionPhase } from '@prisma/client';

const phasePageRelationship = {
    'NEW' : '/sessions/[sessionId]/wait',
    'DRAFT': '/sessions/[sessionId]/wait',
    'IN_PROGRESS': '/sessions/[sessionId]/take/[pageId]',
    'GRADING': '/sessions/[sessionId]/wait',
    'FINISHED': '/sessions/[sessionId]/consult/[questionPage]',
};

const redirectToPhasePage = (phase, router) => {
    if(router.pathname === phasePageRelationship[phase]) return;
    switch(phase){
        case ExamSessionPhase.NEW:
        case ExamSessionPhase.DRAFT:
        case ExamSessionPhase.GRADING:
            router.push(`/exam-sessions/${router.query.sessionId}/wait`);
            return;
        case ExamSessionPhase.IN_PROGRESS:
            router.push(`/exam-sessions/${router.query.sessionId}/take/1`);
            return;
        case ExamSessionPhase.FINISHED:
            router.push(`/exam-sessions/${router.query.sessionId}/consult/1`);
            return;
    }
}

const StudentPhaseRedirect = ({ phase, children }) => {
    const router = useRouter();
    redirectToPhasePage(phase, router);

    return children;
}

export default StudentPhaseRedirect;
