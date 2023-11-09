import {  Role } from '@prisma/client'
import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../middleware/withPrisma'

import {
  IncludeStrategy,
  questionIncludeClause,
} from '../../../../../../code/questions'

/*
used by the jam session pages grading, finished and analytics to fetch the questions of the jam session with official amswers
and include all users answers and gradings

*/
const get = async (req, res, prisma) => {
  const { groupScope, jamSessionId, withGradings = 'false' } = req.query

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
        group: {
            scope: groupScope,
        }
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

export default withMethodHandler({
  GET: withAuthorization(
    withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
})
