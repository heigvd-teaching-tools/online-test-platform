import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

import { getUser } from '@/code/auth'
import {
  questionIncludeClause,
  IncludeStrategy,
} from '@/code/questions'
import {
  isFinished,
} from './questions/[questionId]/answers/utils'


const get = async (req, res, prisma) => {

  const { evaluationId } = req.query
  const { email } = await getUser(req, res)

  if (!(await isFinished(evaluationId, prisma))) {
    res.status(400).json({ message: 'Exam session is not yet finished' })
    return
  }

  let includeQuestions = questionIncludeClause({
    includeTypeSpecific: true,
    includeUserAnswers: {
      strategy: IncludeStrategy.USER_SPECIFIC,
      userEmail: email,
    },
    includeGradings: true,
  })

  const userOnEvaluation = await prisma.userOnEvaluation.findUnique({
    where: {
      userEmail_evaluationId: {
        userEmail: email,
        evaluationId: evaluationId,
      },
    },
    include: {
      evaluation: {
        include: {
          evaluationToQuestions: {
            include: {
              question: {
                include: includeQuestions,
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  if (!userOnEvaluation) {
    res.status(403).json({
      message: 'You are not allowed to access this collections session',
    })
    return
  }
  res.status(200).json(userOnEvaluation.evaluation)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
})
