import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'
import {getUser} from "../../../../code/auth";

const put = async (req, res, prisma) => {
  // change the selected group of the users
  const { groupScope } = req.body

  const user = await getUser(req)

  const allUserGroups = await prisma.userOnGroup.findMany({
    where: {
        userId: user.id,
    },
    include: {
        group: true
    }
  });

  const userInGroup = allUserGroups.find((userOnGroup) => userOnGroup.group.scope === groupScope)

  if (!userInGroup) {
    res.status(400).json({ message: 'You are not a member of this group' })
    return
  }

  const currentUserToGroup = allUserGroups.find((userOnGroup) => userOnGroup.selected)

  if (currentUserToGroup) {
    // unselect the current group
    await prisma.userOnGroup.update({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: currentUserToGroup.group.id,
        },
      },
      data: {
        selected: false,
      },
    })
  }

  // select the new group
  await prisma.userOnGroup.update({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: userInGroup.group.id,
      },
    },
    data: {
      selected: true,
    },
  })

  res.status(200).json({ message: 'ok' })
}


export default withMethodHandler({
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR]
  ),
})
