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
    let include = questionIncludeClause(includeTypeSpecific, includeOfficialAnswers, includeUserAnswers, includeGradings);

    /*  including user answers
        studentAnswer is returned as an array of answers -> one to many relationship
        For IncludeStrategy.USER_SPECIFIC we will have an array with one answers only
        For IncludeStrategy.ALL we will have an array with all the answers related to that questions
    */

    return {
        where,
        include
    }
}

/* TODO: passe single JSON argument object instead of multiple parameters,
create a json object containing default values and merge with the argument object

 */
export const questionIncludeClause = (
    includeTypeSpecific = true,
    includeOfficialAnswers = false,
    includeUserAnswers = undefined,
    includeGradings = false,
    includeTags = true
) => {
    // include question related entities based on the specified context

    const typeSpecific = includeTypeSpecific ? {
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

    let include = typeSpecific;

    if(includeTags) {
        include.questionToTag = {
            include: {
                tag: true
            }
        }
    }

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

    return include;
}


/*
    question is the question object from the request body
    question can be null if we are creating a new question
    using this function we can extract the type specific data (and only that) from the question object
    also used to avoid injections
 */
export const questionTypeSpecific = (questionType, question, mode = "update") => {
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
        case QuestionType.multipleChoice:
            return !question ? {
                // default options when creating a new question
                options: { create: [
                    { text: 'Option 1', isCorrect: false },
                    { text: 'Option 2', isCorrect: true },
                ]}
            } : {
                options:
                    mode === "update" ?
                        // multi choice options are no longer managed on the question level, they are managed by individual endpoints : api/questions/:id/multiple-choice/options
                        { }
                    :
                        // the only use case for mode === "create" is when we are copying questions for a jam session, see api/jam-sessions [POST]
                        {
                            create: question.multipleChoice.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
                        }

                }
        default:
            return {}
    }
}

