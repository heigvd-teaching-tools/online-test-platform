import { EvaluationPhase } from '@prisma/client'

const selectEvaluation = async (evaluationId, prisma) => {
  if (!evaluationId) return null
  return await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true,
    },
  })
}

export const isInProgress = async (evaluationId, prisma) => {
  // get the questions collections session phase
  if (!evaluationId) return false

  const evaluation = await selectEvaluation(evaluationId, prisma)
  return evaluation?.phase === EvaluationPhase.IN_PROGRESS
}

export const isFinished = async (evaluationId, prisma) => {
  // get the questions collections session phase
  if (!evaluationId) return false
  const evaluation = await selectEvaluation(evaluationId, prisma)
  return evaluation?.phase === EvaluationPhase.FINISHED
}
