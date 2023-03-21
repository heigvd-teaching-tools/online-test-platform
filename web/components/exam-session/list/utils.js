import {ExamSessionPhase} from "@prisma/client";
export const displayDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}
export const linkPerPhase = (phase, examSessionId) => {
    switch(phase){
        case ExamSessionPhase.DRAFT:
            return `/exam-sessions/${examSessionId}/draft`;
        case ExamSessionPhase.IN_PROGRESS:
            return `/exam-sessions/${examSessionId}/in-progress`;
        case ExamSessionPhase.GRADING:
            return `/exam-sessions/${examSessionId}/grading/1`;
        case ExamSessionPhase.FINISHED:
            return `/exam-sessions/${examSessionId}/finished`;
        default:
            return `/exam-sessions`;
    }
}
