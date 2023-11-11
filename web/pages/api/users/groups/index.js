import { Role } from '@prisma/client'
import { getUser } from '../../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

const get = async (req, res, prisma) => {
  const user = await getUser(req)
  // get the list of groups that this users is a member of
  const groups = await prisma.userOnGroup.findMany({
    where: {
      userId: user.id,
    },
    include: {
      group: true,
    },
    orderBy: {
      group: {
        createdAt: 'asc',
      },
    },
  })

  res.status(200).json(groups)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
})
