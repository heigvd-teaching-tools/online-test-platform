import { PrismaClient, Role, QuestionType } from '@prisma/client'
import { getUser, getUserSelectedGroup, hasRole } from '../../../code/auth'
import { questionIncludeClause } from '../../../code/questions'

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
  const { search } = req.query

  // find professors users that match the search query

  if (!search || search.length < 2) {
    res.status(200).json([])
    return
  }

  const users = await prisma.user.findMany({
    where: {
      role: Role.PROFESSOR,
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  })

  res.status(200).json(users)
}

export default handler
