import {
  PrismaClient,
  Role,
  JamSessionPhase,
  QuestionType,
} from '@prisma/client'
import { getUserSelectedGroup, hasRole } from '../../../code/auth'
import {
  questionIncludeClause,
  questionTypeSpecific,
} from '../../../code/questions'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'GET':
      await get(res, req)
      break
    case 'POST':
      await post(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (res, req) => {
  // shallow session to question get -> we just need to count the number of questions
  const group = await getUserSelectedGroup(req)

  const jams = await prisma.jamSession.findMany({
    where: {
      groupId: group.id,
    },
    include: {
      jamSessionToQuestions: true,
      students: true,
    },
  })
  res.status(200).json(jams)
}

const post = async (req, res) => {
  const { label, conditions, duration, collectionId } = req.body

  const group = await getUserSelectedGroup(req)

  if (!group) {
    res.status(400).json({ message: 'No group selected.' })
    return
  }

  if (!collectionId) {
    res.status(400).json({ message: 'No collection selected.' })
    return
  }

  // select all questions from a collection
  const collectionToQuestions = await prisma.collectionToQuestion.findMany({
    include: {
      question: {
        include: questionIncludeClause({
          includeTypeSpecific: true,
          includeOfficialAnswers: true,
        }),
      },
    },
    where: {
      collectionId,
    },
  })

  if (
    !collectionToQuestions ||
    (collectionToQuestions && collectionToQuestions.length === 0)
  ) {
    res.status(400).json({ message: 'Your collection has no questions.' })
    return
  }

  if (label.length === 0) {
    res.status(400).json({ message: 'Please enter a label.' })
    return
  }

  let data = {
    phase: JamSessionPhase.DRAFT,
    label,
    conditions,
    group: {
      connect: {
        id: group.id,
      },
    },
  }

  if (duration) {
    data.durationHours = parseInt(duration.hours)
    data.durationMins = parseInt(duration.minutes)
  }

  try {
    let jamSession = undefined
    await prisma.$transaction(async (prisma) => {
      jamSession = await prisma.jamSession.create({ data })

      // create the copy of all questions, except code, for the jam session
      for (const collectionToQuestion of collectionToQuestions.filter(
        (ctq) => ctq.question.type !== QuestionType.code
      )) {
        // create question
        const question = await prisma.question.create({
          data: {
            title: collectionToQuestion.question.title,
            content: collectionToQuestion.question.content,
            type: collectionToQuestion.question.type,
            group: {
              connect: {
                id: collectionToQuestion.question.groupId,
              },
            },
            [collectionToQuestion.question.type]: {
              create: questionTypeSpecific(
                collectionToQuestion.question.type,
                collectionToQuestion.question,
                'create'
              ),
            },
          },
        })
        // create relation between jam session and question
        await prisma.jamSessionToQuestion.create({
          data: {
            points: collectionToQuestion.points,
            order: collectionToQuestion.order,
            jamSession: {
              connect: {
                id: jamSession.id,
              },
            },
            question: {
              connect: {
                id: question.id,
              },
            },
          },
        })
      }

      // create the copy of code questions for the jam session
      for (const collectionToQuestion of collectionToQuestions.filter(
        (ctq) => ctq.question.type === QuestionType.code
      )) {
        // create code question, without files
        const newCodeQuestion = await prisma.question.create({
          data: {
            title: collectionToQuestion.question.title,
            content: collectionToQuestion.question.content,
            group: {
              connect: {
                id: collectionToQuestion.question.groupId,
              },
            },
            type: QuestionType.code,
            code: {
              create: {
                language: collectionToQuestion.question.code.language,
                sandbox: {
                  create: {
                    image: collectionToQuestion.question.code.sandbox.image,
                    beforeAll:
                      collectionToQuestion.question.code.sandbox.beforeAll,
                  },
                },
                testCases: {
                  create: collectionToQuestion.question.code.testCases.map(
                    (testCase) => ({
                      index: testCase.index,
                      exec: testCase.exec,
                      input: testCase.input,
                      expectedOutput: testCase.expectedOutput,
                    })
                  ),
                },
              },
            },
          },
        })

        // create relation between jam session and question
        await prisma.jamSessionToQuestion.create({
          data: {
            points: collectionToQuestion.points,
            order: collectionToQuestion.order,
            jamSession: {
              connect: {
                id: jamSession.id,
              },
            },
            question: {
              connect: {
                id: newCodeQuestion.id,
              },
            },
          },
        })

        // create the copy of template and solution files and link them to the new code questions
        for (const codeToFile of collectionToQuestion.question.code
          .templateFiles) {
          const newFile = await prisma.file.create({
            data: {
              path: codeToFile.file.path,
              content: codeToFile.file.content,
              createdAt: codeToFile.file.createdAt, // for deterministic ordering
              code: {
                connect: {
                  questionId: newCodeQuestion.id,
                },
              },
            },
          })
          await prisma.codeToTemplateFile.create({
            data: {
              questionId: newCodeQuestion.id,
              fileId: newFile.id,
              studentPermission: codeToFile.studentPermission,
            },
          })
        }

        for (const codeToFile of collectionToQuestion.question.code
          .solutionFiles) {
          const newFile = await prisma.file.create({
            data: {
              path: codeToFile.file.path,
              content: codeToFile.file.content,
              createdAt: codeToFile.file.createdAt, // for deterministic ordering
              code: {
                connect: {
                  questionId: newCodeQuestion.id,
                },
              },
            },
          })
          await prisma.codeToSolutionFile.create({
            data: {
              questionId: newCodeQuestion.id,
              fileId: newFile.id,
              studentPermission: codeToFile.studentPermission,
            },
          })
        }
      }
    })

    res.status(200).json(jamSession)
  } catch (e) {
    console.log(e)
    switch (e.code) {
      case 'P2002':
        res.status(409).json({ message: 'Jam session label already exists' })
        break
      default:
        res.status(500).json({ message: 'Error while creating a jam session' })
        break
    }
  }
}

export default handler
