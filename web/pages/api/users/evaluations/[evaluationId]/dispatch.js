import { Role, EvaluationPhase } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma';
import { withMethodHandler, withAuthorization } from '@/middleware/withAuthorization';

import { phaseGT } from '@/code/phase'
import { getUser } from '@/code/auth';

/*
fetch the informations necessary to decide where the users should be redirected
based on the phase of the evaluation and the relation between the users and the evaluation
Will respond with the Evaluation phase and the UserOnEvaluation object
* */
const get = async (req, res, prisma) => {
  const { evaluationId } = req.query

  const user = await getUser(req)

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true,
      label: true,
    },
  })

  if (!evaluation) {
    // something fishy is going on
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const userOnEvaluation = await prisma.userOnEvaluation.findFirst({
    where: {
      evaluationId: evaluationId,
      userEmail: user.email,
    },
  })

  if (!userOnEvaluation) {
    if (phaseGT(evaluation.phase, EvaluationPhase.IN_PROGRESS)) {
      // the users is not in the evaluation, and the evaluation after the in progress phase
      res
        .status(401)
        .json({ message: "It is too late to apologize. It's too late." })
      return
    }
    // the users is not in the evaluation, but its not to late to join
    // the response is still ok
    res.status(200).json({
      evaluation: evaluation,
      userOnEvaluation: null,
    })
    return
  }

  // the users is already in the evaluation
  res.status(200).json({
    evaluation: evaluation,
    userOnEvaluation: userOnEvaluation,
  })
}


export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]),
});
