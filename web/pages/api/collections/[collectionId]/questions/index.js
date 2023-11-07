import { Role } from '@prisma/client'
import { getUserSelectedGroup } from '../../../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../middleware/withPrisma'


/*

 endpoints used for collection compose. Managing questions in a copllection
  post: add a question to a collection
  put: update the points of a question in a collection
  delete: remove a question from a collection
 endpoint used by the autocomplete collection selector
  get: get all shallow questions in a collection -> used by autocomplete when creating a jam session (s collection selector)
*/


const get = async (req, res, prisma) => {
  // get all questions in a collection, only shallow question data for counting purposes
  const { collectionId } = req.query

  const group = await getUserSelectedGroup(req)

  const questions = await prisma.collectionToQuestion.findMany({
    where: {
      collectionId: collectionId,
      collection: {
        groupId: group.id,
      },
    },
    include: {
      question: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  res.status(200).json(questions)
}

const post = async (req, res, prisma) => {
  // add a new question to a collection
  const { collectionId } = req.query
  const { questionId } = req.body

  // find the latest order
  const latestOrder = await prisma.collectionToQuestion.findFirst({
    where: {
      collectionId: collectionId,
    },
    orderBy: {
      order: 'desc',
    },
  })

  const order = latestOrder ? latestOrder.order + 1 : 0

  // In case this question was already used in another collection, fine the last points assigned to it
  const latestPoints = await prisma.collectionToQuestion.findFirst({
    where: {
      questionId: questionId,
    },
    orderBy: {
      order: 'desc',
    },
  })

  const points = latestPoints ? latestPoints.points : undefined

  const collectionToQuestion = await prisma.collectionToQuestion.create({
    data: {
      collectionId: collectionId,
      questionId: questionId,
      points: points,
      order: order,
    },
  })

  // using default value for points

  res.status(200).json(collectionToQuestion)
}

const put = async (req, res, prisma) => {
  // update the collectionToQuestion
  const { collectionToQuestion } = req.body

  await prisma.collectionToQuestion.update({
    where: {
      collectionId_questionId: {
        collectionId: collectionToQuestion.collectionId,
        questionId: collectionToQuestion.questionId,
      },
    },
    data: {
      points: parseFloat(collectionToQuestion.points),
    },
  })

  res.status(200).json({ message: 'OK' })
}

const del = async (req, res, prisma) => {
  // delete a question from a collection
  const { collectionId } = req.query
  const { questionId } = req.body

  await prisma.collectionToQuestion.delete({
    where: {
      collectionId_questionId: {
        collectionId: collectionId,
        questionId: questionId,
      },
    },
  })

  res.status(200).json({ message: 'OK' })
}


export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR]
  ),
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
    withPrisma(del), [Role.PROFESSOR]
  ),
})
