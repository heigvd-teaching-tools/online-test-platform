import {
  PrismaClient,
  Role,
  QuestionType,
  JamSessionPhase, StudentPermission
} from '@prisma/client'
import { getSession } from 'next-auth/react'
import { hasRole } from '../../../../code/auth'
import { grading } from '../../../../code/grading'
import { phaseGT } from '../../../../code/phase'

import {
  questionIncludeClause,
} from '../../../../code/questions'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  const isProfOrStudent =
    (await hasRole(req, Role.PROFESSOR)) || (await hasRole(req, Role.STUDENT))

  if (!isProfOrStudent) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'POST':
      await post(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const post = async (req, res) => {
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

    // Is user already connected to the jam session?
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
        // connect the user to the jam session
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
                        create: {} // good for most question types, except code and database
                    },
                    studentGrading: {
                        create: grading(jstq, undefined),
                    }
                },
                include: {
                    [question.type]: true
                }
            });

            // code and database questions have type specific data to be copied for the student answer
            switch (question.type) {
                case QuestionType.code:
                    await prisma.code.update({
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
        const output = solQuery.output;

        // Create DatabaseQuery instance and store the generated ID
        const createdQuery = await prisma.databaseQuery.create({
            data: {
                order: query.order,
                title: query.title,
                description: query.description,
                content: query.studentPermission === StudentPermission.UPDATE ? query.template : query.content,
                template: undefined,
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

        // Create solution output only if a query is a test query
        if(query.testQuery) {
            await prisma.databaseQueryOutput.create({
                data: {
                    output: output.output,
                    status: output.status,
                    type: output.type,
                    dbms: output.dbms,
                    query: {
                        connect: {
                            id: createdQuery.id,
                        },
                    },
                    studentSolution: {
                        connect: {
                            userEmail_questionId_queryId: {
                                userEmail: studentAnswer.userEmail,
                                questionId: studentAnswer.questionId,
                                queryId: createdQuery.id,
                            },
                        },
                    },
                }
            });
        }
    }
}

export default handler
