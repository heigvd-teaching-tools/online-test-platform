import { useRouter } from 'next/router'
import { JamSessionPhase } from '@prisma/client'

const phasePageRelationship = {
  NEW: '/jam-sessions/new',
  DRAFT: '/jam-sessions/[jamSessionId]/draft',
  IN_PROGRESS: '/jam-sessions/[jamSessionId]/in-progress',
  GRADING: '/jam-sessions/[jamSessionId]/grading/[activeQuestion]',
  FINISHED: '/jam-sessions/[jamSessionId]/finished',
}

const redirectToPhasePage = (phase, router) => {
  const { jamSessionId } = router.query
  if (router.pathname === phasePageRelationship[phase]) return
  console.log("redirecting to phase page", phase)
  switch (phase) {
    case JamSessionPhase.NEW:
      router.push(`/jam-sessions/new`)
      return
    case JamSessionPhase.DRAFT:
      router.push(`/jam-sessions/${jamSessionId}/draft`)
      return
    case JamSessionPhase.IN_PROGRESS:
      router.push(`/jam-sessions/${jamSessionId}/in-progress`)
      return
    case JamSessionPhase.GRADING:
      router.push(`/jam-sessions/${jamSessionId}/grading/1`)
      return
    case JamSessionPhase.FINISHED:
      router.push(`/jam-sessions/${jamSessionId}/finished`)
      return
  }
}

const PhaseRedirect = ({ phase, children }) => {
  const router = useRouter()
  redirectToPhasePage(phase, router)

  return children
}

export default PhaseRedirect
