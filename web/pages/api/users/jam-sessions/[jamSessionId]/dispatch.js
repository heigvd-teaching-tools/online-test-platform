import { Role, JamSessionPhase } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma';
import { withMethodHandler, withAuthorization } from '@/middleware/withAuthorization';

import { phaseGT } from '@/code/phase'
import { getUser } from '@/code/auth';

/*
fetch the informations necessary to decide where the users should be redirected
based on the phase of the jam session and the relation between the users and the jam session
Will respond with the JamSession phase and the UserOnJamSession object
* */
const get = async (req, res, prisma) => {
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
      // the users is not in the jam session, and the jam session after the in progress phase
      res
        .status(401)
        .json({ message: "It is too late to apologize. It's too late." })
      return
    }
    // the users is not in the jam session, but its not to late to join
    // the response is still ok
    res.status(200).json({
      jamSession: jamSession,
      userOnJamSession: null,
    })
    return
  }

  // the users is already in the jam session
  res.status(200).json({
    jamSession: jamSession,
    userOnJamSession: userOnJamSession,
  })
}


export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]),
});
