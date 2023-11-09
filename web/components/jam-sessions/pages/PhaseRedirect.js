import { useRouter } from 'next/router'
import { JamSessionPhase } from '@prisma/client'

const phasePageRelationship = {
  NEW: '/[groupScope]/jam-sessions/new',
  DRAFT: '/[groupScope]/jam-sessions/[jamSessionId]/draft',
  IN_PROGRESS: '/[groupScope]/jam-sessions/[jamSessionId]/in-progress',
  GRADING: '/[groupScope]/jam-sessions/[jamSessionId]/grading/[activeQuestion]',
  FINISHED: '/[groupScope]/jam-sessions/[jamSessionId]/finished',
}

const redirectToPhasePage = (phase, router) => {
  const { groupScope, jamSessionId } = router.query
  if (router.pathname === phasePageRelationship[phase]) return
  switch (phase) {
    case JamSessionPhase.NEW:
      router.push(`/${groupScope}/jam-sessions/new`)
      return
    case JamSessionPhase.DRAFT:
      router.push(`/${groupScope}/jam-sessions/${jamSessionId}/draft`)
      return
    case JamSessionPhase.IN_PROGRESS:
      router.push(`/${groupScope}/jam-sessions/${jamSessionId}/in-progress`)
      return
    case JamSessionPhase.GRADING:
      router.push(`/${groupScope}/jam-sessions/${jamSessionId}/grading/1`)
      return
    case JamSessionPhase.FINISHED:
      router.push(`/${groupScope}/jam-sessions/${jamSessionId}/finished`)
      return
  }
}

const PhaseRedirect = ({ phase, children }) => {
  const router = useRouter()
  redirectToPhasePage(phase, router)

  return children
}

export default PhaseRedirect
