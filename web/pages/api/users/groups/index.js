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
    case 'GET':
      await get(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
  const user = await getUser(req)
  // get the list of groups that this user is a member of
  const groups = await prisma.userOnGroup.findMany({
    where: {
      userId: user.id,
    },
    include: {
      group: true,
    },
  })

  res.status(200).json(groups)
}

export default handler
