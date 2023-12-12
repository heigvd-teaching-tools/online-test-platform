import { EvaluationPhase, Role, StudentAnswerStatus, UserOnEvaluationStatus } from '@prisma/client'
import { isInProgress } from '../utils'
import { grading } from '@/code/grading'
import {
  withAuthorization,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withEvaluationPhase, withStudentStatus } from '@/middleware/withStudentEvaluation'
import { getUser } from '@/code/auth'

/*
  Student update a database query during a evaluation
*/

const put = withEvaluationPhase([EvaluationPhase.IN_PROGRESS], withStudentStatus([UserOnEvaluationStatus.IN_PROGRESS],
  async (req, res, prisma) => {
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { evaluationId, questionId, queryId } = req.query

      const { content } = req.body

      if (!(await isInProgress(evaluationId, prisma))) {
        res.status(400).json({ message: 'Exam session is not in progress' })
        return
      }

      const evaluationToQuestion = await prisma.evaluationToQuestion.findUnique({
        where: {
          evaluationId_questionId: {
            evaluationId: evaluationId,
            questionId: questionId,
          },
        },
        include: {
          question: true,
        },
      })

      if (!evaluationToQuestion) {
        res.status(400).json({ message: 'Question not found' })
        return
      }

      await prisma.$transaction(async (prisma) => {
        // update the status of the users answers
        await prisma.studentAnswer.update({
          where: {
            userEmail_questionId: {
              userEmail: studentEmail,
              questionId: questionId,
            },
          },
          data: {
            status: StudentAnswerStatus.IN_PROGRESS
          },
        })

        // update the users answers query for database question
        await prisma.studentAnswerDatabaseToQuery.update({
          where:{
            userEmail_questionId_queryId: {
              userEmail: studentEmail,
              questionId: questionId,
              queryId: queryId
            }
          },
          data:{
            query:{
              update: {
                content: content
              }
            }
          }
        });

        await prisma.studentQuestionGrading.upsert({
          where: {
            userEmail_questionId: {
              userEmail: studentEmail,
              questionId: questionId,
            },
          },
          create: {
            userEmail: studentEmail,
            questionId: questionId,
            ...grading(evaluationToQuestion.question, evaluationToQuestion.points, undefined),
          },
          update: grading(evaluationToQuestion.question, evaluationToQuestion.points, undefined),
        })
      });

      const updatedAnswer = await prisma.studentAnswer.findUnique({
        where: {
          userEmail_questionId: {
            userEmail: studentEmail,
            questionId: questionId,
          },
        },
        select: {
          status: true,
          database: {
            select: {
              queries: {
                select: {
                  query: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json(updatedAnswer)
    }
  )
)

export default withMethodHandler({
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR, Role.STUDENT]
  ),
})
