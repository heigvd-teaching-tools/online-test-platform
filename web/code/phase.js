import { JamSessionPhase } from '@prisma/client';

export const phaseGT = (a, b) => {
    return Object.keys(JamSessionPhase).indexOf(a) > Object.keys(JamSessionPhase).indexOf(b);
}

export const phasePageRelationship = {
    'NEW' :         '/jam-sessions/[jamSessionId]/wait',
    'DRAFT':        '/jam-sessions/[jamSessionId]/wait',
    'IN_PROGRESS':  '/jam-sessions/[jamSessionId]/take/[pageId]',
    'GRADING':      '/jam-sessions/[jamSessionId]/wait',
    'FINISHED':     '/jam-sessions/[jamSessionId]/consult/[questionPage]',
};

export const redirectToPhasePage = (jamSessionId, phase, router) => {
    switch(phase){
        case JamSessionPhase.NEW:
        case JamSessionPhase.DRAFT:
        case JamSessionPhase.GRADING:
            router.push(`/jam-sessions/${jamSessionId}/wait`);
            return;
        case JamSessionPhase.IN_PROGRESS:
            router.push(`/jam-sessions/${jamSessionId}/take/1`);
            return;
        case JamSessionPhase.FINISHED:
            router.push(`/jam-sessions/${jamSessionId}/consult/1`);
            return;
    }
}
