import { Role } from '@prisma/client'

import {
  withAuthorization,
  withGroupScope,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/**
 * Managing the code files depending on their nature (solution or template)
 * get: get the [nature] files for a code question
 * post: create a new file for a code question
*/

const get = async (req, res, prisma) => {
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

const post = async (req, res, prisma) => {
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

export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
      withGroupScope(withPrisma(post)), [Role.PROFESSOR]
  )
})
