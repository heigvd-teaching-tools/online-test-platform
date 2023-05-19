import { PrismaClient, Role, JamSessionPhase } from '@prisma/client'

import { getUser, getUserSelectedGroup, hasRole } from '../../../../code/auth'
import { phaseGT } from '../../../../code/phase'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  const isProfOrStudent =
    (await hasRole(req, Role.PROFESSOR)) || (await hasRole(req, Role.STUDENT))

  if (!isProfOrStudent) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'GET':
      await get(req, res)
      break
    default:
  }
}
/*
fetch the informations necessary to decide where the user should be redirected
based on the phase of the jam session and the relation between the user and the jam session
Will respond with the JamSession phase and the UserOnJamSession object
* */
const get = async (req, res) => {
  const { jamSessionId } = req.query

  const user = await getUser(req)

  const jamSession = await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
    select: {
      phase: true,
      label: true,
    },
  })

  if (!jamSession) {
    // something fishy is going on
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const userOnJamSession = await prisma.userOnJamSession.findFirst({
    where: {
      jamSessionId: jamSessionId,
      userEmail: user.email,
    },
  })

  if (!userOnJamSession) {
    if (phaseGT(jamSession.phase, JamSessionPhase.IN_PROGRESS)) {
      // the user is not in the jam session, and the jam session after the in progress phase
      res
        .status(401)
        .json({ message: "It is too late to apologize. It's too late." })
      return
    }
    // the user is not in the jam session, but its not to late to join
    // the response is still ok
    res.status(200).json({
      jamSession: jamSession,
      userOnJamSession: null,
    })
    return
  }

  // the user is already in the jam session
  res.status(200).json({
    jamSession: jamSession,
    userOnJamSession: userOnJamSession,
  })
}
export default handler
