import {withAuthorization, withMethodHandler} from "@/middleware/withAuthorization";
import {withPrisma} from "@/middleware/withPrisma";
import { withEvaluationPhase, withStudentStatus } from "@/middleware/withStudentEvaluation";
import {EvaluationPhase, Role, UserOnEvaluationStatus} from "@prisma/client";
import { getSession } from "next-auth/react";

const get = async (req, res, prisma) => {

  const session = await getSession({ req })
  const studentEmail = session.user.email
  
  const { evaluationId } = req.query
  
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true,
      startAt: true,
      endAt: true,
    },
  })

  const userOnEvaluation = await prisma.userOnEvaluation.findUnique({
    where: {
      userEmail_evaluationId: {
        userEmail: studentEmail,
        evaluationId: evaluationId,
      },
    },
  })

  res.status(200).json({
    evaluation: evaluation,
    userOnEvaluation: userOnEvaluation,
  })
}

// student ends his evaluation
const put = withEvaluationPhase([EvaluationPhase.IN_PROGRESS], withStudentStatus([UserOnEvaluationStatus.IN_PROGRESS],
    async (req, res, prisma) => {
      const session = await getSession({ req })
      const studentEmail = session.user.email
      const { evaluationId } = req.query

      await prisma.userOnEvaluation.update({
        where: {
          userEmail_evaluationId: {
            userEmail: studentEmail,
            evaluationId: evaluationId,
          },
        },
        data: {
          status: UserOnEvaluationStatus.FINISHED,
          finishedAt: new Date(),
        },
      })

      res.status(200).json({ message: 'Evaluation completed' })
    }
  )
)

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR, Role.STUDENT]
  ),
})

