import { Role } from '@prisma/client'

import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../../middleware/withPrisma'

/**
 * Managing the test cases of a question
 * put: update a test case
 * del: delete a test case
 */

const put = async (req, res, prisma) => {
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

const del = async (req, res, prisma) => {
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

export default withMethodHandler({
  PUT: withAuthorization(
      withGroupScope(withPrisma(put)), [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
      withGroupScope(withPrisma(del)), [Role.PROFESSOR]
  )
})
