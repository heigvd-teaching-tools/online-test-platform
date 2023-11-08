import { Role } from '@prisma/client'

import { getUser } from '../../../../../code/auth'
import {
  IncludeStrategy,
  questionIncludeClause,
} from '../../../../../code/questions'
import { isInProgress } from '../../../[groupScope]/jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils'
import { withAuthorization, withMethodHandler } from '../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../middleware/withPrisma'

/*
Get the details about thr jam session for a student
get the list of questions of that jam session including points oprder and question
Only shallow question is included (type, title,content ...) without type specific data (code, database, ...
No official answers are included and no question type specific at all
Each question has included the answer for that particular student only

*/

const get = async (req, res, prisma) => {

  const { jamSessionId } = req.query
  const { email } = await getUser(req)

  if (!(await isInProgress(jamSessionId, prisma))) {
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

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.STUDENT]
  ),
})
