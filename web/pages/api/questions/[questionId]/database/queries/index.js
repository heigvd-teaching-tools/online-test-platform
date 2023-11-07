import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../../../middleware/withAuthorization';
import { withPrisma } from '../../../../../../middleware/withPrisma';

const get = async (req, res, prisma) => {
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

const post = async (req, res, prisma) => {
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

export default withMethodHandler({
    GET: withAuthorization(
        withPrisma(get), [Role.PROFESSOR]
    ),
    POST: withAuthorization(
        withPrisma(post), [Role.PROFESSOR]
    )
})

  
