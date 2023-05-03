import {QuestionType, StudentAnswerStatus, StudentQuestionGradingStatus} from "@prisma/client";

export const getSignedSuccessRate = (jamSessionToQuestions) => {
    // total signed points
    let totalSignedPoints = jamSessionToQuestions.reduce((acc, jstq) => {
        let signedGradings = jstq.question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).length;
        return acc + signedGradings * jstq.points;
    }, 0);
    // total signed obtained points
    let totalSignedObtainedPoints = jamSessionToQuestions.reduce((acc, jstq) => acc + jstq.question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).reduce((acc, sa) => acc + sa.studentGrading.pointsObtained, 0), 0);
    return totalSignedPoints > 0 ? Math.round(totalSignedObtainedPoints / totalSignedPoints * 100) : 0;
}

export const getObtainedPoints = (jamSessionToQuestions, participant) => jamSessionToQuestions.reduce((acc, {question}) => {
    let studentGrading = question.studentAnswer.find((sa) => sa.user.id === participant.id).studentGrading;
    return acc + (studentGrading ? studentGrading.pointsObtained : 0);
    }, 0);

export const getGradingStats = (jamSessionToQuestions) => {
    let totalGradings = jamSessionToQuestions.reduce((acc, jstq) => acc + jstq.question.studentAnswer.length, 0);
    let totalSigned = jamSessionToQuestions.reduce((acc, jstq) => acc + jstq.question.studentAnswer.filter((sa) => sa.studentGrading.signedBy).length, 0);
    let totalAutogradedUnsigned = jamSessionToQuestions.reduce((acc, jstq) => acc + jstq.question.studentAnswer.filter((sa) => sa.studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED && !sa.studentGrading.signedBy).length, 0);

    return {
        totalGradings,
        totalSigned,
        totalAutogradedUnsigned
    }
}

export const getQuestionSuccessRate = (question) => {
    let totalPoints = question.points * question.studentAnswer.length;
    let totalObtainedPoints = question.studentAnswer.reduce((acc, sa) => acc + sa.studentGrading.pointsObtained, 0);
    return totalPoints > 0 ? Math.round(totalObtainedPoints / totalPoints * 100) : 0;
}

export const typeSpecificStats = (question) => {
    switch(question.type) {
        case QuestionType.multipleChoice:
            return question[question.type].options.map((option, index) => {
                // number of times this option was selected in student answers
                let chosen = question.studentAnswer.reduce((acc, sa) => {
                    if(sa.status === StudentAnswerStatus.SUBMITTED) {
                        let isChosen = sa[question.type].options.some((o) => o.id === option.id);
                        if(isChosen) {
                            return acc + 1;
                        }
                    }
                    return acc;
                }, 0);
                return {
                    label: `O${index + 1}`,
                    chosen
                }
            });
        case QuestionType.trueFalse:
            let trueChosen = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.SUBMITTED && sa[question.type].isTrue) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            let falseChosen = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.SUBMITTED && !sa[question.type].isTrue) {
                    return acc + 1;
                }
                return acc;

            }, 0);
            return {
                true: {
                    chosen: trueChosen
                },
                false: {
                    chosen: falseChosen
                }
            }
        case QuestionType.code:
            let success  = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.SUBMITTED && sa[question.type].allTestCasesPassed) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            let failure = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.SUBMITTED && !sa[question.type].allTestCasesPassed) {
                    return acc + 1;
                }
                return acc;
            }, 0);

            return {
                success: {
                    count: success
                },
                failure: {
                    count: failure
                }
            }
        case QuestionType.essay:
        case QuestionType.web:
            let submitted = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.SUBMITTED) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            let missing = question.studentAnswer.reduce((acc, sa) => {
                if(sa.status === StudentAnswerStatus.MISSING) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            return {
                submitted: {
                    count: submitted
                },
                missing: {
                    count: missing
                }
            }
        default:
            return null
    }
}
