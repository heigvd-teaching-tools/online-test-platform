import { PrismaClient, Role } from '@prisma/client'

import { hasRole } from '../../../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

// hanlder for PUT and DELETE requests
const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  switch (req.method) {
    case 'PUT':
      await put(req, res)
      break
    case 'DELETE':
      await del(req, res)
      break
    default:
  }
}

const put = async (req, res) => {
  // update a test case
  const { questionId, index } = req.query
  const { exec, input, expectedOutput } = req.body
  const testCase = await prisma.testCase.update({
    where: {
      index_questionId: {
        index: parseInt(index),
        questionId: questionId,
      },
    },
    data: {
      exec,
      input,
      expectedOutput,
    },
  })
  res.status(200).json(testCase)
}

const del = async (req, res) => {
  const { questionId, index } = req.query

  // update the index of the test cases after the deleted one
  const testCases = await prisma.testCase.findMany({
    where: {
      questionId: questionId,
      index: {
        gt: parseInt(index),
      },
    },
  })

  await prisma.$transaction(async (prisma) => {
    await prisma.testCase.delete({
      where: {
        index_questionId: {
          index: parseInt(index),
          questionId: questionId,
        },
      },
    })

    for (let i = 0; i < testCases.length; i++) {
      await prisma.testCase.update({
        where: {
          index_questionId: {
            index: testCases[i].index,
            questionId: questionId,
          },
        },
        data: {
          index: testCases[i].index - 1,
        },
      })
    }
  })

  res.status(200).json('Test case deleted')
}

export default handler
