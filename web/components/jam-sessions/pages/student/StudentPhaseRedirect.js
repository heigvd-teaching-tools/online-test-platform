import { useRouter } from 'next/router';
import { JamSessionPhase } from '@prisma/client';

const phasePageRelationship = {
    'NEW' :         '/jam-sessions/[jamSessionId]/wait',
    'DRAFT':        '/jam-sessions/[jamSessionId]/wait',
    'IN_PROGRESS':  '/jam-sessions/[jamSessionId]/take/[pageId]',
    'GRADING':      '/jam-sessions/[jamSessionId]/wait',
    'FINISHED':     '/jam-sessions/[jamSessionId]/consult/[questionPage]',
};

const redirectToPhasePage = (phase, router) => {
    if(router.pathname === phasePageRelationship[phase]) return;
    switch(phase){
        case JamSessionPhase.NEW:
        case JamSessionPhase.DRAFT:
        case JamSessionPhase.GRADING:
            router.push(`/jam-sessions/${router.query.sessionId}/wait`);
            return;
        case JamSessionPhase.IN_PROGRESS:
            router.push(`/jam-sessions/${router.query.sessionId}/take/1`);
            return;
        case JamSessionPhase.FINISHED:
            router.push(`/jam-sessions/${router.query.sessionId}/consult/1`);
            return;
    }
}

const StudentPhaseRedirect = ({ phase, children }) => {
    const router = useRouter();
    redirectToPhasePage(phase, router);
    return children;
}

export default StudentPhaseRedirect;
