import { Role } from '@prisma/client'

import {withAuthorization, withGroupScope, withMethodHandler} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withQuestionUpdate } from '@/middleware/withQuestionUpdate'

/**
 * Managing the database part of a question
 * Holds the image of the database question
 *
 * get: get the database part of a question
 * put: update the database part of a question
 */

const get = async (req, res, prisma) => {
  // get the "database" part of the question
  const { questionId } = req.query
  const database = await prisma.database.findUnique({
    where: {
      questionId: questionId,
    },
  })

  res.status(200).json(database)
}

const put = async (req, res, prisma) => {
    // update the "database" part of the question
    const { questionId } = req.query
    const { image } = req.body

    const database = await prisma.database.update({
        where: {
          questionId: questionId,
        },
        data: {
          image: image,
        },
    })

    res.status(200).json(database)
}


export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  PUT: withAuthorization(
      withGroupScope(withQuestionUpdate(withPrisma(put))), [Role.PROFESSOR]
  )
})

