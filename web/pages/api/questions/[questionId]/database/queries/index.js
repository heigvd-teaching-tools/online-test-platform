import { PrismaClient, Role } from '@prisma/client'

import { hasRole } from '../../../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

// hanlder for POST, GET

const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  switch (req.method) {
    case 'GET':
      await get(req, res)
      break
    case 'POST':
      await post(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
    // get the queries for a database question

    const { questionId } = req.query

    const queries = await prisma.databaseQuery.findMany({
        where: {
          questionId: questionId,
        },
        include:{
            queryOutput: true,
            queryOutputTests: true,
        },
        orderBy: [
            {
                createdAt: 'asc'
            }
        ]
    });

    if (!queries) res.status(404).json({ message: 'Not found' })

    res.status(200).json(queries)
}

const post = async (req, res) => {
  // create a new empty query for a database question

  const { questionId } = req.query

    const query = await prisma.databaseQuery.create({
        data: {
            questionId: questionId,
        }
    });

    res.status(200).json(query)
}
export default handler
