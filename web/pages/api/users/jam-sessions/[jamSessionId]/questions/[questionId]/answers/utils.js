import { JamSessionPhase } from '@prisma/client'

const selectJamSession = async (jamSessionId, prisma) => {
  if (!jamSessionId) return null
  return await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
    select: {
      phase: true,
    },
  })
}

export const isInProgress = async (jamSessionId, prisma) => {
  // get the questions collections session phase
  if (!jamSessionId) return false

  const jamSession = await selectJamSession(jamSessionId, prisma)
  return jamSession?.phase === JamSessionPhase.IN_PROGRESS
}

export const isFinished = async (jamSessionId, prisma) => {
  // get the questions collections session phase
  if (!jamSessionId) return false
  const jamSession = await selectJamSession(jamSessionId, prisma)
  return jamSession?.phase === JamSessionPhase.FINISHED
}
