import { StudentQuestionGradingStatus, QuestionType } from '@prisma/client';

/*
    This function is used to grade a student answers to a question.
    argument "answers" is the student answers to the question.
    argument "question" is the question to which the student answers is submitted.

    If called with answers = undefined, the function will return the default grading.
    Default grading is generally (pointsObtained = 0, status = AUTOGRADED),

    Grading differs for code questions (pointsObtained = 0, status = UNGRADED) because the grading cannot be determined
    during answers editing (code file editing), the grading of code question is done during the code-check run (see /api/sandbox/[questionId]/student.js).

 */
export const grading = (jamSessionToQuestion, answer) => {
    switch(jamSessionToQuestion.question.type) {
        case QuestionType.multipleChoice:
            return gradeMultipleChoice(jamSessionToQuestion, answer);
        case QuestionType.trueFalse:
            return gradeTrueFalse(jamSessionToQuestion, answer);
        case QuestionType.essay:
            return gradeEssay(jamSessionToQuestion, answer);
        case QuestionType.code:
            // student code submission is graded during code test run
            return gradeCode(jamSessionToQuestion, answer);
        case QuestionType.web:
            return gradeWeb(jamSessionToQuestion, answer);
        default:
            return undefined;
    }
}

const defaultGrading = ({
    status: StudentQuestionGradingStatus.AUTOGRADED,
    pointsObtained: 0
});

const gradeMultipleChoice = (jamSessionToQuestion, answer) => {
    let grading = defaultGrading;

    if(answer !== undefined) {
        let correctOptions = jamSessionToQuestion.question.multipleChoice.options.filter((opt) => opt.isCorrect);
        let answerOptions = answer.options;

        let isCorrect = correctOptions.length === answerOptions.length && correctOptions.every((opt) => answerOptions.some((aOpt) => aOpt.id === opt.id));
        grading = {
            status: StudentQuestionGradingStatus.AUTOGRADED,
            pointsObtained: isCorrect ? jamSessionToQuestion.points : 0
        };

    }
    return grading
}

const gradeTrueFalse = (jamSessionToQuestion, answer) => {
    let grading = defaultGrading;
    if(answer !== undefined) {
        let isCorrect = jamSessionToQuestion.question.trueFalse.isTrue === answer.isTrue;
        grading = {
            ...grading,
            pointsObtained: isCorrect ? jamSessionToQuestion.points : 0
        }
    }
    return grading;
}

/*
    code grading call is done during answers submission and code test run
    code test run : /api/sandbox/[questionId]/student
*/
const gradeCode = (jamSessionToQuestion, response) => {
    let grading = {
        ...defaultGrading,
        status: StudentQuestionGradingStatus.UNGRADED
    };
    const success = response && response.tests.every((test) => test.passed);
    if(success !== undefined) {
        // response is from the code sandbox run
        grading = {
            status: StudentQuestionGradingStatus.AUTOGRADED,
            pointsObtained: success ? jamSessionToQuestion.points : 0
        }
    }
    return grading
};

const gradeEssay = (_, answer) => ({
    ...defaultGrading,
    status: answer ? StudentQuestionGradingStatus.UNGRADED : StudentQuestionGradingStatus.AUTOGRADED
});

const gradeWeb = (_, answer) => ({
    ...defaultGrading,
    status: answer ? StudentQuestionGradingStatus.UNGRADED : StudentQuestionGradingStatus.AUTOGRADED
});

