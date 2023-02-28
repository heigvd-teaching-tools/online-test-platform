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


    // including type specifics with or without official answers
    let include = includeTypeSpecific ? {
        code: ({
            select: {
                ...(includeOfficialAnswers ? { solutionFiles: true } : {}),
                templateFiles: true,
                sandbox: true,
                testCases: true,
                language: true,
            }
        }),
        multipleChoice: {
            select: {
                options: ({
                    select: {
                        id: true,
                        text: true,
                        ...(includeOfficialAnswers ? { isCorrect: true } : { })
                    }
                })
            }
        },
        trueFalse: {
            select: {
                questionId: true,
                ...(includeOfficialAnswers ? { isTrue: true } : {})
            }
        },
        essay: true,
        web: true,
    } : undefined;

    /*  including user answers
        studentAnswer is returned as an array of answers -> one to many relationship
        For IncludeStrategy.USER_SPECIFIC we will have an array with one answer only
        For IncludeStrategy.ALL we will have an array with all the answers related to that questions
    */
    if(includeTypeSpecific && includeUserAnswers) {

        // no "where" for IncludeStrategy.ALL
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
                web: true,
                user: true
            }
        };

        // include gradings
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

    // copy type specific data
    let typeSpecificCopy = { ...question[questionType] };

    // remove questionId from type specific data
    delete typeSpecificCopy.questionId;

    // replace each null or empty array value with undefined, otherwise prisma will throw an error
    Object.keys(typeSpecificCopy).forEach(key => {
        if(typeSpecificCopy[key] === null || (Array.isArray(typeSpecificCopy[key]) && typeSpecificCopy[key].length === 0)) {
            typeSpecificCopy[key] = undefined;
        }
    });

    switch(questionType) {
        case QuestionType.multipleChoice:
            let clauses = {};
            if(currentQuestion) {
                // updating existing questions -> delete all existing options before create
                let toDeleteMany = currentQuestion.multipleChoice && currentQuestion.multipleChoice.options.length > 0;
                if(toDeleteMany) {
                    clauses.deleteMany = {};
                }
            }

            let options = question.multipleChoice.options.map(option => ({
                text: option.text,
                isCorrect: option.isCorrect
            }));

            if(options.length > 0){
                clauses.createMany = {
                    data: options
                }
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
            console.log("QuestionType.code", typeSpecificCopy)
            if(typeSpecificCopy.sandbox) {
                let data = {
                    image: typeSpecificCopy.sandbox.image,
                    beforeAll: typeSpecificCopy.sandbox.beforeAll
                };

                let sandboxId = typeSpecificCopy.sandbox.questionId;
                delete typeSpecificCopy.sandbox.questionId;

                // update or create sandbox
                if(sandboxId) {
                    // updating existing sandbox
                    typeSpecificCopy.sandbox = {
                        update: data
                    }
                }else{
                    // creating new sandbox
                    typeSpecificCopy.sandbox = {
                        create: data
                    }
                }
            }


            return typeSpecificCopy;
        case QuestionType.web:
            return typeSpecificCopy;
        default:
            return undefined;
    }
}

