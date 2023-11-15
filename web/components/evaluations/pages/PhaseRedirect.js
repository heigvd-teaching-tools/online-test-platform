import { useRouter } from 'next/router'
import { EvaluationPhase } from '@prisma/client'

const phasePageRelationship = {
  NEW: '/[groupScope]/evaluations/new',
  DRAFT: '/[groupScope]/evaluations/[evaluationId]/draft',
  IN_PROGRESS: '/[groupScope]/evaluations/[evaluationId]/in-progress',
  GRADING: '/[groupScope]/evaluations/[evaluationId]/grading/[activeQuestion]',
  FINISHED: '/[groupScope]/evaluations/[evaluationId]/finished',
}

const redirectToPhasePage = (phase, router) => {
  const { groupScope, evaluationId } = router.query
  if (router.pathname === phasePageRelationship[phase]) return
  switch (phase) {
    case EvaluationPhase.NEW:
      router.push(`/${groupScope}/evaluations/new`)
      return
    case EvaluationPhase.DRAFT:
      router.push(`/${groupScope}/evaluations/${evaluationId}/draft`)
      return
    case EvaluationPhase.IN_PROGRESS:
      router.push(`/${groupScope}/evaluations/${evaluationId}/in-progress`)
      return
    case EvaluationPhase.GRADING:
      router.push(`/${groupScope}/evaluations/${evaluationId}/grading/1`)
      return
    case EvaluationPhase.FINISHED:
      router.push(`/${groupScope}/evaluations/${evaluationId}/finished`)
      return
  }
}

const PhaseRedirect = ({ phase, children }) => {
  const router = useRouter()
  redirectToPhasePage(phase, router)

  return children
}

export default PhaseRedirect
