import { Role } from '@prisma/client'
import { runSandbox } from '@/sandbox/runSandboxTC'
import { getSession } from 'next-auth/react'
import { grading } from '@/code/grading'
import {isInProgress} from "@/pages/api/users/evaluations/[evaluationId]/questions/[questionId]/answers/utils";
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/*
 endpoint to run the code sandbox for a users answers
 Only uses files stored in the database
 */
const post = async (req, res, prisma) => {
  const session = await getSession({ req })

  const { evaluationId, questionId } = req.query
  const studentEmail = session.user.email

  if (!(await isInProgress(evaluationId, prisma))) {
    res.status(400).json({ message: 'evaluation is not in progress' })
    return
  }


  const code = await prisma.code.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      sandbox: true,
      testCases: true,
      solutionFiles: true // to get the hidden files
    },
  })

  if (!code) {
    res.status(404).json({ message: 'Code not found' })
    return
  }


  const studentAnswerCodeFiles = await prisma.studentAnswerCode.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    include: {
      files: {
        include: {
          file: true,
        },
      },
    },
  })


  if (!studentAnswerCodeFiles || !studentAnswerCodeFiles.files) {
    res.status(404).json({ message: 'Student files not found' })
    return
  }

  const files = studentAnswerCodeFiles.files.map(
    (codeToFile) => codeToFile.file
  )

  await runSandbox({
    image: code.sandbox.image,
    files: files,
    beforeAll: code.sandbox.beforeAll,
    tests: code.testCases,
  }).then(async (response) => {
    // update the status of the users answers
    await prisma.StudentAnswerCode.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: {
        allTestCasesPassed: response.tests.every((test) => test.passed),
        testCaseResults: {
          deleteMany: {},
          create: response.tests.map((test, index) => ({
            index: index + 1,
            exec: test.exec,
            input: test.input,
            output: test.output,
            expectedOutput: test.expectedOutput,
            passed: test.passed,
          })),
        },
      },
    })

    const evaluationToQuestion = await prisma.evaluationToQuestion.findUnique({
      where: {
        evaluationId_questionId: {
          evaluationId: evaluationId,
          questionId: questionId,
        },
      },
      include: {
        question: {
          include: {
            code: true,
          },
        },
      },
    })

    // code questions grading
    await prisma.studentQuestionGrading.upsert({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      update: grading(evaluationToQuestion.question, evaluationToQuestion.points, response),
      create: {
        userEmail: studentEmail,
        questionId: questionId,
        ...grading(evaluationToQuestion.question, evaluationToQuestion.points, response),
      },
    })

    res.status(200).send(response)
  }).catch((error) => {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  })
}

export default withMethodHandler({
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR, Role.STUDENT]
  ),
})
