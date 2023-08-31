import {
  PrismaClient,
  Role,
  QuestionType,
  JamSessionPhase,
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

  // get all the questions for the jam session,

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
  })

  // connect the user to an existing jam session add create empty answers and gradings for each questions
  const transaction = []

  transaction.push(
    prisma.userOnJamSession.upsert({
      where: {
        userEmail_jamSessionId: {
          userEmail: studentEmail,
          jamSessionId: jamSessionId,
        },
      },
      update: {},
      create: {
        userEmail: studentEmail,
        jamSessionId: jamSessionId,
      },
      include: {
        jamSession: {
          select: {
            phase: true, // will be used by JoinPage to redirect to the right page (wait or take jam session)
          },
        },
      },
    })
  )

  // create empty answers and gradings for each questions
  for (const jstq of jamSessionToQuestions) {
    const { question } = jstq

    transaction.push(
      prisma.studentAnswer.upsert({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: question.id,
          },
        },
        update: {},
        create: {
          userEmail: studentEmail,
          questionId: question.id,
          [question.type]: {
            create: createTypeSpecificData(question.type, question)
          },
          studentGrading: {
            create: grading(jstq, undefined),
          },
        },
      })
    )
  }

  // run the transaction
  const [userOnJamSession] = await prisma.$transaction(transaction)
  res.status(200).json(userOnJamSession)
}

const createTypeSpecificData = (questionType, question) => {
  /*
  code and database questions have type specific data to be copied for the student answer
  - code has template files
  - database has queries with starting content being pulled from template
  */
  switch (questionType) {
    case QuestionType.code:
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
    case QuestionType.database:

        return {
            image: question.database.image,
            queries: {
                create: question.database.queries.map((query) => {
                    return {
                        query: {
                            create: {
                                title: query.title,
                                description: query.description,
                                content: query.template, // template is the students starting answer
                                template: undefined,
                                lintRules: query.lintRules,
                                studentPermission: query.studentPermission,
                                testQuery: query.testQuery,
                                queryOutputTests: {
                                    create: query.queryOutputTests.map((queryOutputTest) => {
                                        return {
                                            test: queryOutputTest.test,
                                        }
                                    }),
                                },
                                database:{
                                    connect: {
                                        questionId: question.id,
                                    }
                                }
                            }
                        }
                    }
                })
            }
        }
    default:
        return {}
  }
}

export default handler
