import { PrismaClient, Role } from '@prisma/client'
import { hasRole, getUserSelectedGroup } from '../../../../../code/auth'

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
    case 'POST':
      await post(req, res)
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

const get = async (req, res) => {
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

const post = async (req, res) => {
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

  const collectionToQuestion = await prisma.collectionToQuestion.create({
    data: {
      collectionId: collectionId,
      questionId: questionId,
      order: order,
    },
  })

  // using default value for points

  res.status(200).json(collectionToQuestion)
}

const put = async (req, res) => {
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

const del = async (req, res) => {
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

export default handler
