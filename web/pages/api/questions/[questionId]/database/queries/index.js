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
    // get the solution queries for a database question

    const { questionId } = req.query

    const queries = await prisma.databaseToSolutionQuery.findMany({
        where: {
          questionId: questionId,
        },
        include:{
            query: {
                include: {
                    queryOutputTests: true,
                }
            },
            output: true,
        },
        orderBy: [{
            query: {
                order: 'asc',
            }
        }]
    });

    if (!queries) res.status(404).json({ message: 'Not found' })

    res.status(200).json(queries)
}

const post = async (req, res) => {
  // create a new empty solution query for a database question
  const { questionId } = req.query

    // determine the order of the new query
    const queries = await prisma.databaseToSolutionQuery.findMany({
        where: {
            questionId: questionId,
        }
    });

    const order = queries.length + 1;
    let newQuery;

    const databaseExists = await prisma.database.findUnique({
        where: {
            questionId: questionId,
        },
    });

    await prisma.$transaction(async (prisma) => {
        newQuery = await prisma.databaseQuery.create({
            data: {
                order: order,
                database:{
                    connect: {
                        questionId: questionId,
                    }
                }
            }
        });

        // connect the new solution query to the question
        await prisma.databaseToSolutionQuery.create({
            data: {
                questionId: questionId,
                queryId: newQuery.id,
            }
        })

    });

    res.status(200).json(newQuery)


}
export default handler
