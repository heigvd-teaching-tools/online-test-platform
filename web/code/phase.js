import { ExamSessionPhase } from '@prisma/client';

export const phaseGT = (a, b) => {
    return Object.keys(ExamSessionPhase).indexOf(a) > Object.keys(ExamSessionPhase).indexOf(b);
}