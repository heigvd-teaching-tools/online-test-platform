import { Role } from '@prisma/client'
import {withAuthorization, withGroupScope, withMethodHandler} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
/**
 *
 * Managing the collections of a group
 *
 * get: list collections of a group
 * post: create a new collection
*/
const get = async (req, res, prisma) => {
  const { groupScope } = req.query

  const collections = await prisma.collection.findMany({
    include: {
      collectionToQuestions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    where: {
      group:{
        scope: groupScope
      }
    },
  })
  res.status(200).json(collections)
}

const post = async (req, res, prisma) => {

  const { groupScope } = req.query
  const { label, description } = req.body
  
  try {
    const collection = await prisma.collection.create({
      data: {
        label,
        description,
        group: {
            connect: {
                scope: groupScope
            }
        }
      },
    })
    res.status(200).json(collection)
  } catch (e) {
    switch (e.code) {
      case 'P2002':
        res.status(409).json({ message: 'Collection already exists' })
        break
      default:
        res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
      withGroupScope(withPrisma(post)), [Role.PROFESSOR]
  ),
})



