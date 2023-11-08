import { JamSessionPhase } from '@prisma/client'

export const phaseGT = (a, b) => {
  return (
    Object.keys(JamSessionPhase).indexOf(a) >
    Object.keys(JamSessionPhase).indexOf(b)
  )
}

export const phasePageRelationship = {
  NEW: '/student/jam-sessions/[jamSessionId]/wait',
  DRAFT: '/student/jam-sessions/[jamSessionId]/wait',
  IN_PROGRESS: '/student/jam-sessions/[jamSessionId]/take/[pageId]',
  GRADING: '/student/jam-sessions/[jamSessionId]/wait',
  FINISHED: '/student/jam-sessions/[jamSessionId]/consult/[questionPage]',
}

export const studentPhaseRedirect = async (jamSessionId, phase, router) => {
  // this redirect supposes the user is already connected to the jam session
  // dispatch phase is handling the redirection for the user to connect to the jam session
  switch (phase) {
    case JamSessionPhase.NEW:
    case JamSessionPhase.DRAFT:
    case JamSessionPhase.GRADING:
      await router.push(`/student/jam-sessions/${jamSessionId}/wait`)
      return
    case JamSessionPhase.IN_PROGRESS:
      await router.push(`/student/jam-sessions/${jamSessionId}/take/1`)
      return
    case JamSessionPhase.FINISHED:
      await router.push(`/student/jam-sessions/${jamSessionId}/consult/1`)
      return
  }
}
