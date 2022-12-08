import { ExamSessionPhase } from '@prisma/client';

export const phaseGT = (a, b) => {
    // compare phases by the index of their key in the enum
    let aIndex = Object.keys(ExamSessionPhase).indexOf(a);
    let bIndex = Object.keys(ExamSessionPhase).indexOf(b);


    return Object.keys(ExamSessionPhase).indexOf(a) > Object.keys(ExamSessionPhase).indexOf(b);
}