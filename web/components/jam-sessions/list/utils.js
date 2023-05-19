import { JamSessionPhase } from '@prisma/client'
export const displayDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}
export const linkPerPhase = (phase, examSessionId) => {
  switch (phase) {
    case JamSessionPhase.DRAFT:
      return `/jam-sessions/${examSessionId}/draft`
    case JamSessionPhase.IN_PROGRESS:
      return `/jam-sessions/${examSessionId}/in-progress`
    case JamSessionPhase.GRADING:
      return `/jam-sessions/${examSessionId}/grading/1`
    case JamSessionPhase.FINISHED:
      return `/jam-sessions/${examSessionId}/finished`
    default:
      return `/jam-sessions`
  }
}
