import { Role } from '@prisma/client'
import { runSandbox } from '../../../../sandbox/runSandboxTC'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

/*
    endpoint to run the sandbox for a question with files from the request body
    Should only be used for question update
* */
const post = async (req, res, prisma) => {
  const { questionId } = req.query

  const { files } = req.body

  const code = await prisma.code.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      sandbox: true,
      testCases: {
        orderBy: {
          index: 'asc',
        },
      },
    },
  })

  if (!code) {
    res.status(404).json({ message: 'Code not found' })
    return
  }

  const result = await runSandbox({
    image: code.sandbox.image,
    files: files,
    beforeAll: code.sandbox.beforeAll,
    tests: code.testCases,
  });
  res.status(200).send(result)
}


export default withMethodHandler({
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR]
  ),
})