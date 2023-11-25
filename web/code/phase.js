import { EvaluationPhase } from '@prisma/client'

export const phaseGT = (a, b) => {
  return (
    Object.keys(EvaluationPhase).indexOf(a) >
    Object.keys(EvaluationPhase).indexOf(b)
  )
}

export const phasePageRelationship = {
  NEW: '/users/evaluations/[evaluationId]/wait',
  DRAFT: '/users/evaluations/[evaluationId]/wait',
  IN_PROGRESS: '/users/evaluations/[evaluationId]/take/[pageIndex]',
  GRADING: '/users/evaluations/[evaluationId]/wait',
  FINISHED: '/users/evaluations/[evaluationId]/consult/[questionPage]',
}

export const studentPhaseRedirect = async (evaluationId, phase, router) => {
  // this redirect supposes the users is already connected to the evaluation
  // dispatch phase is handling the redirection for the users to connect to the evaluation
  switch (phase) {
    case EvaluationPhase.NEW:
    case EvaluationPhase.DRAFT:
    case EvaluationPhase.GRADING:
      await router.push(`/users/evaluations/${evaluationId}/wait`)
      return
    case EvaluationPhase.IN_PROGRESS:
      await router.push(`/users/evaluations/${evaluationId}/take/0`)
      return
    case EvaluationPhase.FINISHED:
      await router.push(`/users/evaluations/${evaluationId}/consult/1`)
      return
  }
}
