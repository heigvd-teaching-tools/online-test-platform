import { JamSessionPhase } from '@prisma/client'
export const displayDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}
export const linkPerPhase = (groupScope, phase, jamSessionId) => {
  switch (phase) {
    case JamSessionPhase.DRAFT:
      return `/${groupScope}/jam-sessions/${jamSessionId}/draft`
    case JamSessionPhase.IN_PROGRESS:
      return `/${groupScope}/jam-sessions/${jamSessionId}/in-progress`
    case JamSessionPhase.GRADING:
      return `/${groupScope}/jam-sessions/${jamSessionId}/grading/1`
    case JamSessionPhase.FINISHED:
      return `/${groupScope}/jam-sessions/${jamSessionId}/finished`
    default:
      return `/${groupScope}/jam-sessions`
  }
}
