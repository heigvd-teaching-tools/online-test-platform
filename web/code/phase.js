import { JamSessionPhase } from '@prisma/client';

export const phaseGT = (a, b) => {
    return Object.keys(JamSessionPhase).indexOf(a) > Object.keys(JamSessionPhase).indexOf(b);
}
