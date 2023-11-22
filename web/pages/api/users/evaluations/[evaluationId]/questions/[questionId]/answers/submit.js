import {
  Role,
  StudentAnswerStatus,
  StudentPermission,
  QuestionType,
} from '@prisma/client'

import { getSession } from 'next-auth/react'
import { isInProgress } from './utils'
import { grading } from '@/code/grading'
import {
  withAuthorization,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/*
 endpoint to handle users answers submission status
  PUT : Set the answer status to SUBMITTED
  DELETE : Set the answer status to IN_PROGRESS
*/
const put = async (req, res, prisma) => {
  // update users answers
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { evaluationId, questionId } = req.query

  if (!(await isInProgress(evaluationId, prisma))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  // Update the StudentAnswer status to SUBMITTED
  await prisma.studentAnswer.update({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    data: {
      status: StudentAnswerStatus.SUBMITTED,
    },
  })

  res.status(200).json({ message: 'Answer submitted' })
}

const del = async (req, res, prisma) => {
  // update users answers
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { evaluationId, questionId } = req.query

  if (!(await isInProgress(evaluationId, prisma))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  // Update the StudentAnswer status to IN_PROGRESS
  await prisma.studentAnswer.update({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    data: {
      status: StudentAnswerStatus.IN_PROGRESS,
    },
  })

  res.status(200).json({ message: 'Answer status updated' })

}

export default withMethodHandler({
  PUT: withAuthorization(
      withPrisma(put), [Role.STUDENT, Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
      withPrisma(del), [Role.STUDENT, Role.PROFESSOR]
  ),
})
