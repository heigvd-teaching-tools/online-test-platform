import { PrismaClient, Role } from '@prisma/client'

import {
  IncludeStrategy,
  questionIncludeClause,
} from '../../../../../code/questions'
import { getUserSelectedGroup, hasRole } from '../../../../../code/auth'

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
    const { jamSessionId, userEmail } = req.query

    const group = await getUserSelectedGroup(req)

    const jamSession = await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId,
           
        },
        include: {
            jamSessionToQuestions: {
            include: {
                question: {
                    include: questionIncludeClause({
                        includeTypeSpecific: true,
                        includeOfficialAnswers: true,
                        includeUserAnswers: {
                            strategy: IncludeStrategy.USER_SPECIFIC,
                            userEmail: userEmail,
                        },
                        includeGradings: true,
                    }),
                },
            },
            orderBy: {
                order: 'asc',
            },
            },
        },
    });

    res.status(200).json(jamSession)

}

export default handler


