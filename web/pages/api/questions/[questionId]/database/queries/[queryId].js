import {DatabaseQueryOutputTest, PrismaClient, Role} from '@prisma/client'

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
    case 'PUT':
        await put(req, res)
        break
    case 'DELETE':
        await del(req, res)
        break
    default:
        res.status(405).json({ message: 'Method not allowed' })
    }
}


const put = async (req, res) => {
  // update a query for a database question

  const { questionId, queryId } = req.query
    const {
        title,
        description,
        content,
        template,
        lintRules,
        studentPermission,
        queryOutputTests,
        testQuery
  } = req.body

    // check if the query belongs to the question
    const checkQuery = await prisma.databaseQuery.findUnique({
        where: {
            id: queryId
        }
    });

    if (!checkQuery) {
        res.status(404).json({ message: 'Not found' })
        return
    }

    if (checkQuery.questionId !== questionId) {
        res.status(404).json({ message: 'Not found' })
        return
    }

    const query = await prisma.databaseQuery.update({
        where: {
            id: queryId
        },
        data: {
            title: title,
            description: description,
            content: content,
            template: template,
            lintRules: lintRules,
            studentPermission: studentPermission,
            testQuery: testQuery,
            queryOutputTests: {
                deleteMany: {},
                create: queryOutputTests.map(queryOutputTest => ({ test: DatabaseQueryOutputTest[queryOutputTest.test] }))
            }
        }
    });

    res.status(200).json(query)
}

const del = async (req, res) => {
  // DELETE a query for a database question

    const { questionId, queryId } = req.query

    // check if the query belongs to the question
    const checkQuery = await prisma.databaseQuery.findUnique({
        where: {
            id: queryId
        }
    });

    if (!checkQuery) {
        res.status(404).json({ message: 'Not found' })
        return
    }

    if (checkQuery.questionId !== questionId) {
        res.status(404).json({ message: 'Not found' })
        return
    }

    const query = await prisma.databaseQuery.delete({
        where: {
            id: queryId
        }
    });

    res.status(200).json(query)
}

export default handler
