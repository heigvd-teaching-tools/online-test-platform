import { PrismaClient, Role } from '@prisma/client'
import { getUser, hasRole } from '../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'DELETE':
      await del(req, res)
      break
    case 'PUT':
      await put(req, res)
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const del = async (req, res) => {
  // delete a group
  const { groupId } = req.query

  const user = await getUser(req)

  // check if the user is an owner of the group they are trying to delete
  const userIsOwnerOfGroup = await prisma.group.findFirst({
    where: {
      id: groupId,
      createdBy: {
        id: user.id,
      },
    },
  })

  if (!userIsOwnerOfGroup) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  await prisma.group.delete({
    where: {
      id: groupId,
    },
  })

  res.status(200).json({ message: 'Group deleted' })
}

const put = async (req, res) => {
  // update a group
  const { groupId } = req.query
  const { label } = req.body

  const user = await getUser(req)

  // check if the user is a member of the group they are trying to update
  const userIsMemberOfGroup = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  })

  if (!userIsMemberOfGroup) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  // check if the label is not already taken
  const labelIsTaken = await prisma.group.findFirst({
    where: {
      label: label,
    },
  })

  if (labelIsTaken) {
    res.status(400).json({ message: 'Label is already taken' })
    return
  }

  const updatedGroup = await prisma.group.update({
    where: {
      id: groupId,
    },
    data: {
      label: label,
    },
  })

  res.status(200).json(updatedGroup)
}

export default handler
