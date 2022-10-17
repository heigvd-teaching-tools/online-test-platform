import { StudentQuestionGradingStatus, QuestionType } from '@prisma/client';

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
    code test run : /api/code/test/answer/[questionId].js
*/
const gradeCode = (question, response) => {
    let grading = {
        ...defaultGrading,
        status: StudentQuestionGradingStatus.UNGRADED
    };
    if(response && response.success !== undefined) {
        // answer is the response from the code test run
        grading = {
            status: StudentQuestionGradingStatus.AUTOGRADED,
            pointsObtained: response.success ? question.points : 0
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

