import { Role } from '@prisma/client'
import { getUser } from '../../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

const put = async (req, res, prisma) => {
  // change the selected group of the user
  const { groupId } = req.body

  const user = await getUser(req)

  const usersGroups = user.groups

  const currentUserToGroup = usersGroups.find(
    (userToGroup) => userToGroup.selected
  )

  // check is the user is in the group he wants to select
  const userInGroup = usersGroups.find(
    (userToGroup) => userToGroup.group.id === groupId
  )

  if (!userInGroup) {
    res.status(400).json({ message: 'You are not a member of this group' })
    return
  }

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
        groupId: groupId,
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
