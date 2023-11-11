import { Role, StudentAnswerStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'
import { isInProgress } from '../utils'
import { grading } from '../../../../../../../../../code/grading'
import { withPrisma } from '../../../../../../../../../middleware/withPrisma'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler
} from '../../../../../../../../../middleware/withAuthorization'
/*
  Student updated a code file during a ham session

*/
const put = async (req, res, prisma) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { jamSessionId, questionId, fileId } = req.query

  const { file } = req.body

  if (!(await isInProgress(jamSessionId, prisma))) {
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

  // update the status of the users answers
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

  // update the users answers file for code question
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

export default withMethodHandler({
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR, Role.STUDENT]
  )
})
