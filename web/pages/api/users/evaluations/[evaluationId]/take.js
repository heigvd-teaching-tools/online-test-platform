import { EvaluationPhase, Role, UserOnEvaluationStatus } from '@prisma/client'

import { getUser } from '@/code/auth'
import {
  IncludeStrategy,
  questionIncludeClause,
} from '@/code/questions'
import { isInProgress } from './questions/[questionId]/answers/utils'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withEvaluationPhase, withStudentStatus } from '@/middleware/withStudentEvaluation'

/*
Get the details about thr evaluation for a users
get the list of questions of that evaluation including points oprder and question
Only shallow question is included (type, title,content ...) without type specific data (code, database, ...
No official answers are included and no question type specific at all
Each question has included the answer for that particular users only

*/

const get = withEvaluationPhase([EvaluationPhase.IN_PROGRESS], withStudentStatus([UserOnEvaluationStatus.IN_PROGRESS],
  async (req, res, prisma) => {

      const { evaluationId } = req.query
      const { email } = await getUser(req, res)

      if (!(await isInProgress(evaluationId, prisma))) {
        res.status(400).json({ message: 'evaluation is not in progress' })
        return
      }

      let includeQuestions = questionIncludeClause({
        includeTypeSpecific: false,
        includeUserAnswers: {
          strategy: IncludeStrategy.USER_SPECIFIC,
          userEmail: email,
        },
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
        res
          .status(403)
          .json({ message: 'You are not allowed to access this evaluation' })
        return
      }

      res.status(200).json(userOnEvaluation.evaluation)
    }
  )
)

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
})
