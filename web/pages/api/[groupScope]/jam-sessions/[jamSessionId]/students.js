import { Role } from '@prisma/client'
import { withPrisma } from '../../../../../middleware/withPrisma';
import {withMethodHandler, withAuthorization, withGroupScope} from '../../../../../middleware/withAuthorization';

const get = async (req, res, prisma) => {
  const { jamSessionId } = req.query
  const jamSession = await prisma.jamSession.findUnique({
    where: {
      id: jamSessionId,
    },
    include: {
      students: {
        select: {
          user: true,
          registeredAt: true,
        },
      },
      jamSessionToQuestions: {
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
  res.status(200).json(jamSession)
}

export default withMethodHandler({
  GET: withAuthorization(
    withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
});
