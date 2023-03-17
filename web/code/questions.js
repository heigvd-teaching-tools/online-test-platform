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
                            }
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
    questionTypeSpecific is considered to be replaced as part of abandoning the single query approach for update and create of question.
    It is hard to manage the creates and updates with the single query depending on relationships.
    It is easier to manage the type specific data separately and then connect it with the question.
 */
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
            // type specific does not have any specific fields
            return {}
        case QuestionType.web:
            return typeSpecificCopy;
        case QuestionType.code:
            // update managed separately, create does not manage related files (we dont have questionId yet)
            const isCreate = !currentQuestion;
            return isCreate ? {
                language: question.code.language,
                sandbox: {
                    create: {
                        image: question.code.sandbox.image,
                        beforeAll: question.code.sandbox.beforeAll
                    }
                },
                testCases: {
                    create: question.code.testCases.map(testCase => ({
                        index: testCase.index,
                        exec: testCase.exec,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput
                    }))
                }
            } : {};
        default:
            return undefined;
    }
}

