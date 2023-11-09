import { withPrisma } from '../../../../../middleware/withPrisma';
import { withMethodHandler, withAuthorization } from '../../../../../middleware/withAuthorization';
import { getSession } from 'next-auth/react';
import { Role, JamSessionPhase, QuestionType, StudentPermission } from '@prisma/client';
import { phaseGT } from '../../../../../code/phase';
import { questionIncludeClause } from '../../../../../code/questions';
import { grading } from '../../../../../code/grading';

const post = async (req, res, prisma) => {

    const { jamSessionId } = req.query
    const session = await getSession({ req })
    const studentEmail = session.user.email

    const jamSession = await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId,
        },
    })

    if (!jamSession) {
        res.status(404).json({ message: 'Not found' })
        return
    }

    if (phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)) {
        res.status(400).json({ message: 'Too late' })
        return
    }

    // Is users already connected to the jam session?
    let userOnJamSession = await prisma.userOnJamSession.findUnique({
        where: {
            userEmail_jamSessionId: {
                userEmail: studentEmail,
                jamSessionId: jamSessionId,
            }
        },
        include: {
            jamSession: {
                select: {
                    phase: true,
                }
            }
        }
    });

    if (userOnJamSession) {
        res.status(200).json(userOnJamSession)
        return
    }

    await prisma.$transaction(async (prisma) => {
        // connect the users to the jam session
        userOnJamSession = await prisma.userOnJamSession.create({
            data: {
                userEmail: studentEmail,
                jamSessionId: jamSessionId,
            },
            include: {
                jamSession: {
                    select: {
                        phase: true,
                    }
                }
            }
        })

        // get all the questions of the jam session,
        const jamSessionToQuestions = await prisma.jamSessionToQuestion.findMany({
            where: {
                jamSessionId: jamSessionId,
            },
            include: {
                question: {
                    include: questionIncludeClause({
                        includeTypeSpecific: true,
                        includeOfficialAnswers: true,
                    }),
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        // create empty answers and gradings for each questions
        for (const jstq of jamSessionToQuestions) {
            const {question} = jstq

            const studentAnswer = await prisma.studentAnswer.create({
                data: {
                    userEmail: studentEmail,
                    questionId: question.id,
                    [question.type]: {
                        create: {} // good for most question types
                    },
                    studentGrading: {
                        create: grading(question, jstq.points, undefined),
                    }
                },
                include: {
                    [question.type]: true
                }
            });

            // code and database questions have type specific data to be copied for the users answer
            switch (question.type) {
                case QuestionType.web:
                    await prisma.studentAnswerWeb.update({
                        where: {
                            userEmail_questionId: {
                                userEmail: studentEmail,
                                questionId: question.id,
                            }
                        },
                        data: {
                            html: question.web.templateHtml || '',
                            css: question.web.templateCss || '',
                            js: question.web.templateJs || '',
                        }
                    });
                    break;
                case QuestionType.code:
                    await prisma.studentAnswerCode.update({
                        where: {
                            userEmail_questionId: {
                                userEmail: studentEmail,
                                questionId: question.id,
                            }
                        },
                        data: createCodeTypeSpecificData(question),
                    });
                    break;
                case QuestionType.database:
                    await createDatabaseTypeSpecificData(prisma, studentAnswer, question);
                    break;

            }
        }

    });
    res.status(200).json(userOnJamSession)
}


const createCodeTypeSpecificData = (question) => {
    return {
        files: {
            create: question.code.templateFiles.map((codeToFile) => {
                return {
                    studentPermission: codeToFile.studentPermission,
                    order: codeToFile.order,
                    file: {
                        create: {
                            path: codeToFile.file.path,
                            content: codeToFile.file.content,
                            createdAt: codeToFile.file.createdAt,
                            code: {
                                connect: {
                                    questionId: question.id,
                                },
                            },
                        },
                    },
                }
            }),
        },
    }
}

const createDatabaseTypeSpecificData = async (prisma, studentAnswer, question) => {
    // Create DatabaseQuery and StudentAnswerDatabaseToQuery instances and related outputs
    for (const solQuery of question.database.solutionQueries) {
        const query = solQuery.query;

        // Create DatabaseQuery instance and store the generated ID
        const createdQuery = await prisma.databaseQuery.create({
            data: {
                order: query.order,
                title: query.title,
                description: query.description,
                content: query.studentPermission === StudentPermission.UPDATE ? query.template : query.content,
                template: undefined,
                lintActive: query.lintActive,
                lintRules: query.lintRules,
                studentPermission: query.studentPermission,
                testQuery: query.testQuery,
                queryOutputTests: {
                    create: query.queryOutputTests.map((queryOutputTest) => {
                        return {
                            test: queryOutputTest.test,
                        };
                    }),
                },
                database: {
                    connect: {
                        questionId: question.id,
                    },
                },
            },
        });

        // Create a StudentAnswerDatabaseToQuery instance using the ID of the created DatabaseQuery
        await prisma.studentAnswerDatabaseToQuery.create({
            data: {
                queryId: createdQuery.id,
                userEmail: studentAnswer.userEmail,
                questionId: studentAnswer.questionId,
            },
        });

    }
}

export default withMethodHandler({
    POST: withAuthorization(
        withPrisma(post), [Role.PROFESSOR, Role.STUDENT]
    ),
});
