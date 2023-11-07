import { Role } from '@prisma/client'
import {
  questionIncludeClause,
  questionTypeSpecific,
} from '../../../../code/questions'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

/** 
 * Managing a question
 * 
 * get: get a question by id
 * put: update a question
 *  only handles true/false, multiple choice, essay, and web questions, see questionTypeSpecific for more info
 *  database and code question have separate endpoints 
*/

const get = async (req, res, prisma) => {
  // get a question by id

  const { questionId } = req.query

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: questionIncludeClause({
      includeTypeSpecific: true,
      includeOfficialAnswers: true,
    }),
  })
  res.status(200).json(question)
}

const put = async (req, res, prisma) => {
  const { question } = req.body

  const updatedQuestion = await prisma.question.update({
    where: { id: question.id },
    data: {
      title: question.title,
      content: question.content,
      [question.type]: {
        update: questionTypeSpecific(question.type, question),
      },
    },
    include: {
      code: { select: { language: true } },
      multipleChoice: {
        select: { options: { select: { text: true, isCorrect: true } } },
      },
      trueFalse: { select: { isTrue: true } },
      essay: true,
      web: true,
    },
  })

  res.status(200).json(updatedQuestion)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR]
  ),
})

