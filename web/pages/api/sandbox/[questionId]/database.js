import { PrismaClient, Role } from '@prisma/client'
import { hasRole } from '../../../../code/auth'
import { runSandbox } from '../../../../sandbox/runSandboxTC'
import {runSandboxDB} from "../../../../sandbox/runSandboxDB";

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {
  let isProf = await hasRole(req, Role.PROFESSOR)

  if (!isProf) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'POST':
      await post(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

/*
 endpoint to run the sandbox for a database question with queries recovered from the database
 */
const post = async (req, res) => {
  const { questionId } = req.query

    const database = await prisma.database.findUnique({
        where: {
            questionId: questionId
        },
        include: {
            queries: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    const queries = database.queries.map(query => query.solution);

    const result = await runSandboxDB({
        image: database.image,
        queries: queries,
    })

    // for each query, upsert the DatabaseQueryOutput in the database
    for (let i = 0; i < database.queries.length; i++) {
        const query = database.queries[i];
        const output = result[i];
        await prisma.databaseQueryOutput.upsert({
            where: {
                queryId: query.id,
            },
            update: {
                output: output,
                type: output.type,
            },
            create: {
                output: output,
                type: output.type,
                query: {
                    connect: {
                        id: query.id
                    }
                }
            }
        })
    }

    console.log("result: ", result);

    res.status(200).send(result)
}
