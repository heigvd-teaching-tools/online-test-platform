import {QuestionType, StudentFilePermission} from '@prisma/client';

export const IncludeStrategy = {
    ALL: 'all',
    USER_SPECIFIC: 'user_specific',
}

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
    let include = questionIncludeClause(includeTypeSpecific, includeOfficialAnswers);

    /*  including user answers
        studentAnswer is returned as an array of answers -> one to many relationship
        For IncludeStrategy.USER_SPECIFIC we will have an array with one answer only
        For IncludeStrategy.ALL we will have an array with all the answers related to that questions
    */

    if(includeUserAnswers) {

        // no "where" for IncludeStrategy.ALL
        let saWhere = includeUserAnswers.strategy === IncludeStrategy.USER_SPECIFIC ? {
            userEmail: includeUserAnswers.userEmail
        } : undefined;

        include.studentAnswer = {
            where: saWhere,
            select: {
                status: true,
                code: {
                    select: {
                        files: {
                            include: {
                                file: true
                            },
                            orderBy: [{
                                file: { createdAt: "asc" }
                            },{
                                file: { questionId: "asc" }
                            }]
                        },
                        testCaseResults: true,
                        allTestCasesPassed: true,
                    }
                },
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
                include: {
                    signedBy: true
                }
            };
        }
    }

    return {
        where,
        include
    }
}

export const questionIncludeClause = (includeTypeSpecific, includeOfficialAnswers) => {
    // including type specifics with or without official answers
    let include = includeTypeSpecific ? {
        code: ({
            select: {
                ...(includeOfficialAnswers ? {
                solutionFiles: {
                    include: {
                        file: true
                    },
                    orderBy: [{
                        file: { createdAt: "asc" }
                    },{
                        file: { questionId: "asc" }
                    }]
                }} : {}),
                templateFiles: {
                    ...(includeOfficialAnswers ? {
                        where: {
                          studentPermission: {
                              not: StudentFilePermission.HIDDEN
                          }
                        }} : {}),
                    include: {
                        file: true
                    },
                    orderBy: [{
                        file: { createdAt: "asc" }
                    },{
                        file: { questionId: "asc" }
                    }]
                },
                language: true,
                sandbox: true,
                testCases: true,
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
    } : {};
    return include;
}


/*
    question is the question object from the request body
    question can be null if we are creating a new question
    using this function we can extract the type specific data (and only that) from the question object
    also used to avoid injections
 */
export const questionTypeSpecific = (questionType, question) => {
    switch(questionType) {
        case QuestionType.trueFalse:
            return {
                isTrue: question?.trueFalse.isTrue ?? true
            }
        case QuestionType.web:
            return {
                html: question?.web.html ?? '',
                css: question?.web.css ?? '',
                js: question?.web.js ?? ''
            }
        case QuestionType.multipleChoice: // only for create
            return !question ? {
                options: { create: [
                    { text: 'Option 1', isCorrect: false },
                    { text: 'Option 2', isCorrect: true },
                ]}
            } : {}
        default:
            return {}
    }
}

