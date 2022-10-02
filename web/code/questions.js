import { Role, QuestionType } from '@prisma/client';

export const IncludeStrategy = {
    ALL: 'all',
    USER_SPECIFIC: 'user_specific',
}

/*

console.log(buildPrismaQuestionsQuery({
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

export const buildPrismaQuestionsQuery = ( { 
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


const prepareTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.multipleChoice:
            return {
                options: { create: question[questionType].options.length > 0 ? question[questionType].options : undefined }
            };
        case QuestionType.trueFalse:
            return question[questionType];
        case QuestionType.essay:
            return {}
        case QuestionType.code:
            return question[questionType]
        default:
            return undefined;
    }
}

