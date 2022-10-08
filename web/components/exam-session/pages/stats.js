import { StudentQuestionGradingStatus } from "@prisma/client";

export const getSignedSuccessRate = (questions) => {
    // total signed points
    let totalSignedPoints = questions.reduce((acc, question) => {
        let signedGradings = question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).length;
        return acc + signedGradings * question.points;
    }, 0);
    // total signed obtained points
    let totalSignedObtainedPoints = questions.reduce((acc, question) => acc + question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).reduce((acc, sa) => acc + sa.studentGrading.pointsObtained, 0), 0);
    return totalSignedPoints > 0 ? Math.round(totalSignedObtainedPoints / totalSignedPoints * 100) : 0;
}

export const getObtainedPoints = (questions, participant) => questions.reduce((acc, question) => {
    let studentGrading = question.studentAnswer.find((sa) => sa.user.id === participant.id).studentGrading;
    return acc + (studentGrading ? studentGrading.pointsObtained : 0);
    }, 0);

export const getGradingStats = (questions) => {
    let totalGradings = questions.reduce((acc, question) => acc + question.studentAnswer.length, 0);
    let totalSigned = questions.reduce((acc, question) => acc + question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).length, 0);
    let totalAutogradedUnsigned = questions.reduce((acc, question) => acc + question.studentAnswer.filter((sa) => sa.studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED && !sa.studentGrading.signedBy).length, 0);

    return {
        totalGradings,
        totalSigned,
        totalAutogradedUnsigned
    }
}