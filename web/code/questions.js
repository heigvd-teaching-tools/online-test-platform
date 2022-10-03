import { QuestionType } from '@prisma/client';

export const IncludeStrategy = {
    ALL: 'all',
    USER_SPECIFIC: 'user_specific',
}

/*

console.log(questionsWithIncludes({
    parentResource: 'exam',
    parentResourceId: examId,
    includeOfficialAnswers: true,
    includeGradings: true,
    includeUserAnswers: {
        strategy: IncludeStrategy.ALL,
        userEmail: req.query.email
    }
}));

*/

const multiChoiceOptions = (withAnswer) => ({
    select: {
        id: true,
        text: true,
        ...(withAnswer ? { isCorrect: true } : {})
    }
});

const code = (withAnswer) => ({
    select: {
        ...(withAnswer ? { solution: true } : {}),
        code: true
    }
});

const trueFalse = (withAnswer) => withAnswer;

export const questionsWithIncludes = ( { 
    parentResource, 
    parentResourceId, 
    includeTypeSpecific,
    includeOfficialAnswers, 
    includeUserAnswers, 
    includeGradings 
}) => {

    let where = parentResource ? {
        [parentResource]: {
            id: parentResourceId
        }
    } : undefined;

    let include = includeTypeSpecific ? {
        code: code(includeOfficialAnswers),
        multipleChoice: { 
            select: { 
                options: multiChoiceOptions(includeOfficialAnswers) 
            }
        },
        trueFalse: trueFalse(includeOfficialAnswers),
        essay: true,
    } : undefined;

    if(includeTypeSpecific && includeUserAnswers) {

        let saWhere = includeUserAnswers.strategy === IncludeStrategy.USER_SPECIFIC ? {
            userEmail: includeUserAnswers.userEmail
        } : undefined;
        
        include.studentAnswer = {
            where: saWhere,
            select: {
                status: true,
                code: true,
                multipleChoice: { select: { options: { select: { id: true, text: true } } } },
                essay: { select: { content: true } },
                trueFalse: true,
                user: true
            }
        };
        
        if(includeGradings) {
            include.studentAnswer.select.studentGrading = {
                select: {
                    questionId: true,
                    userEmail: true,
                    createdAt: true,
                    status: true,
                    pointsObtained: true,
                    signedBy: true,
                    comment: true,
                }
            };
        }
    }

    return {
        where,
        include
    }
}

export const questionTypeSpecific = (questionType, question, currentQuestion) => {
    let typeSpecificCopy = { ...question[questionType] };
    delete typeSpecificCopy.questionId;
    switch(questionType) {
        case QuestionType.multipleChoice:
            let clauses = {};   
            if(currentQuestion) { 
                // updating existing question -> delete all existing options before create
                let toDeleteMany = currentQuestion.multipleChoice && currentQuestion.multipleChoice.options.length > 0;
                if(toDeleteMany) {
                    clauses.deleteMany = {};
                }
            }

            let options = question.multipleChoice.options.map(option => ({
                text: option.text,
                isCorrect: option.isCorrect
            }));

            clauses.createMany = {
                data: options.length > 0 ? options : undefined
            }

            return { 
                options: {
                    ...clauses
                } 
            };
        case QuestionType.trueFalse:
            return typeSpecificCopy;
        case QuestionType.essay:
            // type specific does not have any specific fields, might carry the solution in the future
            return {} 
        case QuestionType.code:
            return typeSpecificCopy
        default:
            return undefined;
    }
}

