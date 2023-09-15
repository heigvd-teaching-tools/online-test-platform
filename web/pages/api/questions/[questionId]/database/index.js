import { PrismaClient, Role } from '@prisma/client'

import { hasRole } from '../../../../../code/auth'

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
    case 'PUT':
        await put(req, res)
        break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}
const get = async (req, res) => {
  // get the "database" part of the question
  const { questionId } = req.query
  const database = await prisma.database.findUnique({
    where: {
      questionId: questionId,
    },
  })

  res.status(200).json(database)
}

const put = async (req, res) => {
    // update the "database" part of the question
    const { questionId } = req.query
    const { image } = req.body

    const database = await prisma.database.update({
        where: {
          questionId: questionId,
        },
        data: {
          image: image,
        },
    })

    res.status(200).json(database)
}

export default handler
