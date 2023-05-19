import { PrismaClient, Role } from '@prisma/client'

import { hasRole, getUser } from '../../../../../code/auth'
import {
  IncludeStrategy,
  questionIncludeClause,
} from '../../../../../code/questions'
import { isInProgress } from '../../../jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      await get(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
  const isProf = await hasRole(req, Role.PROFESSOR)
  const isStudent = await hasRole(req, Role.STUDENT)

  if (!(isProf || isStudent)) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const { jamSessionId } = req.query
  const { email } = await getUser(req)

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Jam Session is not in progress' })
    return
  }

  let includeQuestions = questionIncludeClause({
    includeTypeSpecific: false,
    includeUserAnswers: {
      strategy: IncludeStrategy.USER_SPECIFIC,
      userEmail: email,
    },
  })

  const userOnJamSession = await prisma.userOnJamSession.findUnique({
    where: {
      userEmail_jamSessionId: {
        userEmail: email,
        jamSessionId: jamSessionId,
      },
    },
    include: {
      jamSession: {
        include: {
          jamSessionToQuestions: {
            include: {
              question: {
                include: includeQuestions,
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  if (!userOnJamSession) {
    res
      .status(403)
      .json({ message: 'You are not allowed to access this jam session' })
    return
  }
  res.status(200).json(userOnJamSession.jamSession)
}

export default handler
