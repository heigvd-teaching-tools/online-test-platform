import { JamSessionPhase } from '@prisma/client'

export const phaseGT = (a, b) => {
  return (
    Object.keys(JamSessionPhase).indexOf(a) >
    Object.keys(JamSessionPhase).indexOf(b)
  )
}

export const phasePageRelationship = {
  NEW: '/users/jam-sessions/[jamSessionId]/wait',
  DRAFT: '/users/jam-sessions/[jamSessionId]/wait',
  IN_PROGRESS: '/users/jam-sessions/[jamSessionId]/take/[pageId]',
  GRADING: '/users/jam-sessions/[jamSessionId]/wait',
  FINISHED: '/users/jam-sessions/[jamSessionId]/consult/[questionPage]',
}

export const studentPhaseRedirect = async (jamSessionId, phase, router) => {
  // this redirect supposes the users is already connected to the jam session
  // dispatch phase is handling the redirection for the users to connect to the jam session
  switch (phase) {
    case JamSessionPhase.NEW:
    case JamSessionPhase.DRAFT:
    case JamSessionPhase.GRADING:
      await router.push(`/users/jam-sessions/${jamSessionId}/wait`)
      return
    case JamSessionPhase.IN_PROGRESS:
      await router.push(`/users/jam-sessions/${jamSessionId}/take/1`)
      return
    case JamSessionPhase.FINISHED:
      await router.push(`/users/jam-sessions/${jamSessionId}/consult/1`)
      return
  }
}
