import { PrismaClient, Role, StudentAnswerStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'
import { hasRole } from '../../../../../../../../code/auth'
import { isInProgress } from '../utils'
import { grading } from '../../../../../../../../code/grading'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  let isProfOrStudent =
    (await hasRole(req, Role.PROFESSOR)) || (await hasRole(req, Role.STUDENT))

  if (!isProfOrStudent) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'PUT':
      await put(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const put = async (req, res) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { jamSessionId, questionId, fileId } = req.query

  const { file } = req.body

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  const jamSessionToQuestion = await prisma.jamSessionToQuestion.findUnique({
    where: {
      jamSessionId_questionId: {
        jamSessionId: jamSessionId,
        questionId: questionId,
      },
    },
    include: {
      question: true,
    },
  })

  if (!jamSessionToQuestion) {
    res.status(400).json({ message: 'Question not found' })
    return
  }

  const transaction = [] // to do in single transaction, queries are done in order

  // update the status of the student answers
  transaction.push(
    prisma.studentAnswer.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: {
        status: StudentAnswerStatus.SUBMITTED
      },
    })
  )

  // update the student answers file for code question
  transaction.push(
    prisma.studentAnswerCodeToFile.update({
      where: {
        userEmail_questionId_fileId: {
          userEmail: studentEmail,
          questionId: questionId,
          fileId: fileId,
        },
      },
      data: {
        file: {
          update: {
            content: file.content,
          },
        },
      },
    })
  )

  // grade question
  transaction.push(
    prisma.studentQuestionGrading.upsert({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      create: {
        userEmail: studentEmail,
        questionId: questionId,
        ...grading(jamSessionToQuestion.question, jamSessionToQuestion.points, undefined),
      },
      update: grading(jamSessionToQuestion.question, jamSessionToQuestion.points, undefined),
    })
  )

  // prisma transaction
  await prisma.$transaction(transaction)

  const updatedAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    select: {
      status: true,
      code: {
        select: {
          files: {
            select: {
              file: true,
            },
          },
        },
      },
    },
  })

  res.status(200).json(updatedAnswer)
}

export default handler
