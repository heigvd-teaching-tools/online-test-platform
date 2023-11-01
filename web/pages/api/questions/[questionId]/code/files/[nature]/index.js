import { PrismaClient, Role } from '@prisma/client'

import { hasRole } from '../../../../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

// hanlder for POST, GET

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
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
  // get the [nature] files for a code question

  const { questionId, nature } = req.query

  const model =
    nature === 'solution'
      ? prisma.codeToSolutionFile
      : prisma.codeToTemplateFile

  const codeToFiles = await model.findMany({
    where: { questionId },
    orderBy: { order: 'asc' },
    include: {
      file: true,
    },
  })

  if (!codeToFiles) res.status(404).json({ message: 'Not found' })

  res.status(200).json(codeToFiles)
}

const post = async (req, res) => {
  // create a new file for a code question
  // as the file is created for a code question we handle it through CodeToFile entity

  const { questionId, nature } = req.query
  const {
    file: { path, content },
  } = req.body

  const model =
    nature === 'solution'
      ? prisma.codeToSolutionFile
      : prisma.codeToTemplateFile

  const order = await model.count({ where: { questionId } })

  const codeToFile = await model.create({
    data: {
      order: order,
      file: {
        create: {
          path,
          content,
          code: {
            connect: { questionId },
          },
        },
      },
      code: {
        connect: {
          questionId: questionId,
        },
      },
    },
    include: {
      file: true,
    },
  })
  if (!codeToFile) res.status(404).json({ message: 'Not found' })
  res.status(200).json(codeToFile)
}
export default handler
