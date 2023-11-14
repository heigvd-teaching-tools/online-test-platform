import { Role } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma';
import {withMethodHandler, withAuthorization, withGroupScope} from '@/middleware/withAuthorization';

const get = async (req, res, prisma) => {
  const { jamSessionId } = req.query
  const jamSession = await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
    select: {
      phase: true,
      startAt: true,
      endAt: true,
    },
  })
  res.status(200).json(jamSession)
}

export default withMethodHandler({
  GET: withAuthorization(
    withGroupScope(withPrisma(get)), [Role.PROFESSOR, Role.STUDENT]
  ),
})
