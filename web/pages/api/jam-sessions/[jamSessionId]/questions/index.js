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
  const { jamSessionId, withGradings = 'false' } = req.query
  const group = await getUserSelectedGroup(req)

  let questionIncludeOptions = {
    includeTypeSpecific: true,
    includeOfficialAnswers: true,
  }

  if (withGradings === 'true') {
    questionIncludeOptions.includeUserAnswers = {
      strategy: IncludeStrategy.ALL,
    }
    questionIncludeOptions.includeGradings = true
  }

  const questions = await prisma.jamSessionToQuestion.findMany({
    where: {
      jamSessionId: jamSessionId,
      question: {
        groupId: group.id,
      },
    },
    include: {
      question: {
        include: questionIncludeClause(questionIncludeOptions),
      },
    },
    orderBy: {
      order: 'asc',
    },
  })
  res.status(200).json(questions)
}

export default handler
