import {
  PrismaClient,
  Role,
  QuestionType,
  StudentPermission,
} from '@prisma/client'
import { getUserSelectedGroup, hasRole } from '../../../code/auth'
import {
  questionIncludeClause,
  questionTypeSpecific,
} from '../../../code/questions'

import languages from '../../../code/languages.json'
const environments = languages.environments

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
      await get(req, res)
      break
    case 'POST':
      await post(req, res)
      break
    case 'DELETE':
      await del(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
  const group = await getUserSelectedGroup(req)

  if (!group) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  let { title, content, tags, questionTypes, codeLanguages } = req.query

  questionTypes = questionTypes
    ? questionTypes.split(',').map((type) => QuestionType[type])
    : []
  codeLanguages = codeLanguages ? codeLanguages.split(',') : []

  tags = tags ? tags.split(',') : []

  let where = {
    where: {
      groupId: group.id,
      jamSession: null, // only get questions that are not part of a jam session
    },
  }

  // use AND for title and content
  if (title) {
    where.where.title = {
      contains: title,
    }
  }

  if (content) {
    where.where.content = {
      contains: content,
    }
  }

  if (tags.length > 0) {
    where.where.questionToTag = {
      some: {
        label: {
          in: tags,
        },
      },
    }
  }

  // use OR for question types and code languages
  if (questionTypes.length > 0) {
    /*
            in case the question type is code, we need to filter by the language of the code
            why we need to do a separate OR entry to filter by language,
            thus we must remove the code type from the questionTypes array in this OR entry
        */
    where.where.OR
      ? where.where.OR.push({
          type: {
            in: questionTypes.filter((type) => type !== QuestionType.code),
          },
        })
      : (where.where.OR = [
          {
            type: {
              in: questionTypes.filter((type) => type !== QuestionType.code),
            },
          },
        ])
  }

  if (questionTypes.includes(QuestionType.code) && codeLanguages.length > 0) {
    where.where.OR
      ? where.where.OR.push({
          code: {
            language: {
              in: codeLanguages,
            },
          },
        })
      : (where.where.OR = [
          {
            code: {
              language: {
                in: codeLanguages,
              },
            },
          },
        ])
  }

  const questions = await prisma.question.findMany({
    ...where,
    include: {
      ...questionIncludeClause({
        includeTypeSpecific: true,
        includeOfficialAnswers: true,
      }),
      jamSession: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  res.status(200).json(questions)
}

const post = async (req, res) => {
  // create a new question -> at this point we only know the question type

  const { type } = req.body
  const questionType = QuestionType[type]

  if (!questionType) {
    res.status(400).json({ message: 'Invalid question type' })
    return
  }

  const group = await getUserSelectedGroup(req)

  let createdQuestion = await prisma.question.create({
    data: {
      type: questionType,
      title: '',
      content: '',
      [questionType]: {
        create: questionTypeSpecific(questionType, null),
      },
      group: {
        connect: {
          id: group.id,
        },
      },
    },
    include: questionIncludeClause(true, true),
  })

  if (questionType === QuestionType.code) {
    // this must be done in a separate query because the files must be connected to the already existing code question
    const { language } = req.body
    // get the default code for the language
    const defaultCode = codeBasedOnLanguage(language)
    // update the empty initial code with the default code
    await prisma.code.update(
      codeInitialUpdateQuery(createdQuestion.id, defaultCode)
    )
    createdQuestion = await prisma.question.findUnique({
      where: {
        id: createdQuestion.id,
      },
      include: questionIncludeClause(true, true),
    })
  }

  res.status(200).json(createdQuestion)
}

const del = async (req, res) => {
  const { question } = req.body

  if (!question?.id) {
    res.status(400).json({ message: 'Bad Request' })
    return
  }

  // find all the collections that contain this question
  const collections = await prisma.collection.findMany({
    where: {
      collectionToQuestions: {
        some: {
          questionId: question.id,
        },
      },
    },
    include: {
      collectionToQuestions: true,
    },
  })

  let deletedQuestion = undefined
  await prisma.$transaction(async (prisma) => {
    // decrease the order of CollectionToQuestion for all orders greater than the order of the question in the collection
    for (const collection of collections) {
      // filter the collectionToQuestions that have a greater order than the question
      const collectionToQuestions = collection.collectionToQuestions.filter(
        (ctq) =>
          ctq.order >
          collection.collectionToQuestions.find(
            (ctq) => ctq.questionId === question.id
          ).order
      )
      for (const ctq of collectionToQuestions) {
        await prisma.collectionToQuestion.update({
          where: {
            collectionId_questionId: {
              collectionId: ctq.collectionId,
              questionId: ctq.questionId,
            },
          },
          data: {
            order: ctq.order - 1,
          },
        })
      }
    }
    // delete the question
    deletedQuestion = await prisma.question.delete({
      where: {
        id: question.id,
      },
    })
  })

  res.status(200).json(deletedQuestion)
}

const codeBasedOnLanguage = (language) => {
  const index = environments.findIndex((env) => env.language === language)
  return {
    language: environments[index].language,
    sandbox: {
      image: environments[index].sandbox.image,
      beforeAll: environments[index].sandbox.beforeAll,
    },
    files: {
      template: environments[index].files.template,
      solution: environments[index].files.solution,
    },
    testCases: environments[index].testCases,
  }
}

const codeInitialUpdateQuery = (questionId, code) => {
  return {
    where: {
      questionId: questionId,
    },
    data: {
      language: code.language,
      sandbox: {
        create: {
          image: code.sandbox.image,
          beforeAll: code.sandbox.beforeAll,
        },
      },
      testCases: {
        create: code.testCases.map((testCase, index) => ({
          index: index + 1,
          exec: testCase.exec,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
        })),
      },
      solutionFiles: {
        create: code.files.solution.map((file) => ({
          file: {
            create: {
              path: file.path,
              content: file.content,
              code: {
                connect: {
                  questionId: questionId,
                },
              },
            },
          },
        })),
      },
      templateFiles: {
        create: code.files.template.map((file) => ({
          studentPermission: StudentPermission.UPDATE,
          file: {
            create: {
              path: file.path,
              content: file.content,
              code: {
                connect: {
                  questionId: questionId,
                },
              },
            },
          },
        })),
      },
      question: {
        connect: {
          id: questionId,
        },
      },
    },
  }
}

export default handler
