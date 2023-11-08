import { Role } from '@prisma/client'

import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../../middleware/withPrisma'

/**
 *
  * Managing the sandbox part of a code question
  * Handles images and beforeAll
  * get: get the sandbox for a code question
  * put: update the sandbox for a code question
  * post: create the sandbox for a code question
 */

const get = async (req, res, prisma) => {
  // get the sandbox for a code question
  const { questionId } = req.query
  const sandbox = await prisma.sandBox.findUnique({
    where: {
      questionId: questionId,
    },
  })
  if (!sandbox) res.status(404).json({ message: 'Sandbox not found' })
  res.status(200).json(sandbox)
}

const put = async (req, res, prisma) => {
  // update a sandbox
  const { questionId } = req.query

  const { image, beforeAll } = req.body

  const sandbox = await prisma.sandBox.update({
    where: {
      questionId: questionId,
    },
    data: {
      image,
      beforeAll,
    },
  })

  res.status(200).json(sandbox)
}

const post = async (req, res, prisma) => {
  // create a new sandbox
  const { questionId } = req.query

  const { image, beforeAll } = req.body

  const sandbox = await prisma.sandBox.create({
    data: {
      image,
      beforeAll,
      questionId: questionId,
    },
  })

  res.status(200).json(sandbox)
}


export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  PUT: withAuthorization(
      withGroupScope(withPrisma(put)), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
      withGroupScope(withPrisma(post)), [Role.PROFESSOR]
  )
})
