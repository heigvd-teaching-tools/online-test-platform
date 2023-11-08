import {  Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../middleware/withPrisma'

import {
  IncludeStrategy,
  questionIncludeClause,
} from '../../../../../../code/questions'
import { getUserSelectedGroup } from '../../../../../../code/auth'

/*
used by the jam session pages grading, finished and analytics to fetch the questions of the jam session with official amswers
and include all student answers and gradings

*/
const get = async (req, res, prisma) => {
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

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]),
})
