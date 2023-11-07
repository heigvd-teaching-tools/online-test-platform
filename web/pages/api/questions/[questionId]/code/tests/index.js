import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../middleware/withPrisma'

/**
 * Managing the test cases of a code question
 * get: get the list of test cases for a code question
 * post: create a new test case for a code question
 */

const get = async (req, res, prisma) => {
  // get the list of test cases for a code question
  const { questionId } = req.query
  const testCases = await prisma.testCase.findMany({
    where: {
      questionId: questionId,
    },
    orderBy: {
      index: 'asc',
    },
  })
  if (!testCases) res.status(404).json({ message: 'Test cases not found' })
  res.status(200).json(testCases)
}

const post = async (req, res, prisma) => {
  // create a new test case for a code question
  const { questionId } = req.query
  const { exec, input, expectedOutput } = req.body

  const count = await prisma.testCase.count({
    where: {
      questionId: questionId,
    },
  })

  const testCase = await prisma.testCase.create({
    data: {
      index: count + 1,
      exec,
      input,
      expectedOutput,
      questionId: questionId,
    },
  })
  res.status(200).json(testCase)
}

export default withMethodHandler({
  GET: withAuthorization(
      withPrisma(get), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
      withPrisma(post), [Role.PROFESSOR]
  )
})

