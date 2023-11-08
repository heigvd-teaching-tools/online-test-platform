import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../middleware/withPrisma'

import { getUser } from '../../../../../code/auth'
import {
  questionIncludeClause,
  IncludeStrategy,
} from '../../../../../code/questions'
import {
  isFinished,
} from '../../../[groupScope]/jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils'


const get = async (req, res, prisma) => {

  const { jamSessionId } = req.query
  const { email } = await getUser(req)

  if (!(await isFinished(jamSessionId, prisma))) {
    res.status(400).json({ message: 'Exam session is not yet finished' })
    return
  }

  let includeQuestions = questionIncludeClause({
    includeTypeSpecific: true,
    includeUserAnswers: {
      strategy: IncludeStrategy.USER_SPECIFIC,
      userEmail: email,
    },
    includeGradings: true,
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
    res.status(403).json({
      message: 'You are not allowed to access this collections session',
    })
    return
  }
  res.status(200).json(userOnJamSession.jamSession)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
})
