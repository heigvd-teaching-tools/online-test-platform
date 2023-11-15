import {withAuthorization, withMethodHandler} from "@/middleware/withAuthorization";
import {withPrisma} from "@/middleware/withPrisma";
import {Role} from "@prisma/client";

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
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
})
