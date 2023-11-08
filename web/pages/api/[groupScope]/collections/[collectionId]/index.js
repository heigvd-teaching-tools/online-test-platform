import { Role } from '@prisma/client'
import { questionIncludeClause } from '../../../../../code/questions'
import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../middleware/withPrisma'

/*
 collection compose - collection content (list of questions), delete collection, update collection label

 get: get a collection with its questions -> used by the collection compose

*/

const get = async (req, res, prisma) => {
  const { collectionId } = req.query

  const collectionWithQuestions = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
    include: {
      collectionToQuestions: {
        include: {
          question: {
            include: questionIncludeClause({
              includeTypeSpecific: false,
              includeOfficialAnswers: false,
            }),
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  res.status(200).json(collectionWithQuestions)
}

const put = async (req, res, prisma) => {
  const { collectionId } = req.query
  const { collection } = req.body

  const updated = await prisma.collection.update({
    where: {
      id: collectionId,
    },
    data: {
      label: collection.label,
    },
  })

  res.status(200).json(updated)
}

const del = async (req, res, prisma) => {
  const { collectionId } = req.query
  const collection = await prisma.collection.delete({
    where: {
      id: collectionId,
    },
  })
  res.status(200).json(collection)
}


export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  PUT: withAuthorization(
      withGroupScope(withPrisma(put)), [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
      withGroupScope(withPrisma(del)), [Role.PROFESSOR]
  ),
})

