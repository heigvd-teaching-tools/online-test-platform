import { Role } from '@prisma/client'
import { runSandbox } from '@/sandbox/runSandboxTC'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/*
 endpoint to run the sandbox for a question with solution files recovered from the database
 used by the pull from sulution files feature that fills the test cases with the solution output
 */
const post = async (req, res, prisma) => {
  const { questionId } = req.query

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
      solutionFiles: {
        include: {
          file: true,
        },
      },
    },
  })

  if (!code || !code.solutionFiles) {
    res.status(404).json({ message: 'Code not found' })
    return
  }

  const files = code.solutionFiles.map((codeToFile) => codeToFile.file)

  const result = await runSandbox({
    image: code.sandbox.image,
    files: files,
    beforeAll: code.sandbox.beforeAll,
    tests: code.testCases,
  })

  res.status(200).send(result)
}

export default withMethodHandler({
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR]
  ),
})
