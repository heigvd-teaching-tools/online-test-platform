import { Role } from '@prisma/client'
import { getUserSelectedGroup } from '../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'
/** 
 * 
 * Managing the collections of a group 
 * 
 * get: list collections of a group
 * post: create a new collection
*/
const get = async (req, res, prisma) => {
  const group = await getUserSelectedGroup(req)

  if (!group) {
    res.status(400).json({ message: 'No group selected.' })
    return
  }

  const collections = await prisma.collection.findMany({
    include: {
      collectionToQuestions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    where: {
      groupId: group.id,
    },
  })
  res.status(200).json(collections)
}

const post = async (req, res, prisma) => {
  const { label, description } = req.body

  const group = await getUserSelectedGroup(req)

  try {
    const collection = await prisma.collection.create({
      data: {
        label,
        description,
        groupId: group.id,
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
    withPrisma(get), [Role.PROFESSOR]
  ),
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR]
  ),
})



