import { useRouter } from 'next/router'
import { EvaluationPhase } from '@prisma/client'

const phasePageRelationship = {
  NEW: '/[groupScope]/evaluation/new',
  DRAFT: '/[groupScope]/evaluation/[evaluationId]/draft',
  IN_PROGRESS: '/[groupScope]/evaluation/[evaluationId]/in-progress',
  GRADING: '/[groupScope]/evaluation/[evaluationId]/grading/[activeQuestion]',
  FINISHED: '/[groupScope]/evaluation/[evaluationId]/finished',
}

const redirectToPhasePage = (phase, router) => {
  const { groupScope, evaluationId } = router.query
  if (router.pathname === phasePageRelationship[phase]) return
  switch (phase) {
    case EvaluationPhase.NEW:
      router.push(`/${groupScope}/evaluation/new`)
      return
    case EvaluationPhase.DRAFT:
      router.push(`/${groupScope}/evaluation/${evaluationId}/draft`)
      return
    case EvaluationPhase.IN_PROGRESS:
      router.push(`/${groupScope}/evaluation/${evaluationId}/in-progress`)
      return
    case EvaluationPhase.GRADING:
      router.push(`/${groupScope}/evaluation/${evaluationId}/grading/1`)
      return
    case EvaluationPhase.FINISHED:
      router.push(`/${groupScope}/evaluation/${evaluationId}/finished`)
      return
  }
}

const PhaseRedirect = ({ phase, children }) => {
  const router = useRouter()
  redirectToPhasePage(phase, router)

  return children
}

export default PhaseRedirect
