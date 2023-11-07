import { Role } from '@prisma/client'
import { getUserSelectedGroup } from '../../../code/auth'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'

/** 
 * List of tahs of a group
 * 
 * get: list tags of a group used by the question filtering by tags autocomplete  
 */

const get = async (req, res, prisma) => {
  const group = await getUserSelectedGroup(req)

  if (!group) {
    res.status(404).json({ message: 'Group not found' })
    return
  }

  // get all tags for this group
  const tags = await prisma.tag.findMany({
    where: {
      groupId: group.id,
    },
  })

  res.status(200).json(tags)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
})

