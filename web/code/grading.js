import { StudentQuestionGradingStatus, QuestionType } from '@prisma/client';

/*
    This function is used to grade a student answer to a question.
    argument "answer" is the student answer to the question.
    argument "question" is the question to which the student answer is submitted.

    If called with answer = undefined, the function will return the default grading.
    Default grading is generally (pointsObtained = 0, status = AUTOGRADED),

    Grading differs for code questions (pointsObtained = 0, status = UNGRADED) because the grading cannot be determined
    during answer editing (code file editing), the grading of code question is done during the code-check run (see /api/sandbox/[questionId]/student.js).

 */
export const grading = (question, answer) => {
    switch(question.type) {
        case QuestionType.multipleChoice:
            return gradeMultipleChoice(question, answer);
        case QuestionType.trueFalse:
            return gradeTrueFalse(question, answer);
        case QuestionType.essay:
            return gradeEssay(question, answer);
        case QuestionType.code:
            // student code submission is graded during code test run
            return gradeCode(question, answer);
        case QuestionType.web:
            return gradeWeb(question, answer);
        default:
            return undefined;
    }
}

const defaultGrading = ({
    status: StudentQuestionGradingStatus.AUTOGRADED,
    pointsObtained: 0
});

const gradeMultipleChoice = (question, answer) => {
    let grading = defaultGrading;
    if(answer !== undefined) {
        let correctOptions = question.multipleChoice.options.filter((opt) => opt.isCorrect);
        let answerOptions = answer.options;
        let isCorrect = correctOptions.length === answerOptions.length && correctOptions.every((opt) => answerOptions.some((aOpt) => aOpt.id === opt.id));
        grading = {
            status: StudentQuestionGradingStatus.AUTOGRADED,
            pointsObtained: isCorrect ? question.points : 0
        };
    }
    return grading
}

const gradeTrueFalse = (question, answer) => {
    let grading = defaultGrading;
    if(answer !== undefined) {
        let isCorrect = question.trueFalse.isTrue === answer.isTrue;
        grading = {
            ...grading,
            pointsObtained: isCorrect ? question.points : 0
        }
    }
    return grading;
}

/*
    code grading call is done during answer submission and code test run
    code test run : /api/sandbox/[questionId]/student
*/
const gradeCode = (question, response) => {
    const success = response && response.tests.every((test) => test.passed);
    let grading = {
        ...defaultGrading,
        status: StudentQuestionGradingStatus.UNGRADED
    };
    if(response && success !== undefined) {
        //  response is from the code sandbox run
        grading = {
            status: StudentQuestionGradingStatus.AUTOGRADED,
            pointsObtained: success ? question.points : 0
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

