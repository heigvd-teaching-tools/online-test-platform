import { Role } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma';
import {withMethodHandler, withAuthorization, withGroupScope} from '@/middleware/withAuthorization';

const get = async (req, res, prisma) => {
  const { evaluationId } = req.query
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    include: {
      students: {
        select: {
          user: true,
          registeredAt: true,
          finishedAt: true,
          status: true,
        },
        orderBy: {
          registeredAt: 'asc',
        },
      },
      evaluationToQuestions: {
        select: {
          question: {
            select:{
              id: true,
              title: true,
              studentAnswer:{
                select:{
                  question: {
                    select:{
                      id: true
                    }
                  },
                  userEmail: true,
                  status: true
                }
              },
            },
          },
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      }
    },
  })
  res.status(200).json(evaluation)
}

export default withMethodHandler({
  GET: withAuthorization(
    withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
});
