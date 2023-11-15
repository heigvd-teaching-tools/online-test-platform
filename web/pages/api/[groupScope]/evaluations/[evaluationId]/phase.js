import { Role } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma';
import {withMethodHandler, withAuthorization, withGroupScope} from '@/middleware/withAuthorization';

const get = async (req, res, prisma) => {
  const { evaluationId } = req.query
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true,
      startAt: true,
      endAt: true,
    },
  })
  res.status(200).json(evaluation)
}

export default withMethodHandler({
  GET: withAuthorization(
    withGroupScope(withPrisma(get)), [Role.PROFESSOR, Role.STUDENT]
  ),
})
