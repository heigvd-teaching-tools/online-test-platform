import { Role } from '@prisma/client'
import { getUser } from '../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'
/**
 * Managing groups
 * 
 * post: create a new group
 *
 */

const post = async (req, res, prisma) => {
  // create a new group
  const { label, select } = req.body

  const user = await getUser(req)

  try {
    const group = await prisma.group.create({
      data: {
        label,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        members: {
          create: {
            userId: user.id,
          },
        },
      },
    })

    if (select) {
      await prisma.userOnGroup.upsert({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: group.id,
          },
        },
        update: {
          selected: true,
        },
        create: {
          selected: true,
        },
      })
    }

    res.status(200).json(group)
  } catch (e) {
    switch (e.code) {
      case 'P2002':
        res
          .status(409)
          .json({ message: 'A group with that label already exists' })
        break
      default:
        res.status(500).json({ message: 'Internal server error' })
    }
  }
}


export default withMethodHandler({
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR]
  ),
})
