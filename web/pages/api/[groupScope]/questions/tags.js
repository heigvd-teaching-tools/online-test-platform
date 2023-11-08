import { Role } from '@prisma/client'
import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

/**
 * List of tahs of a group
 *
 * get: list tags of a group used by the question filtering by tags autocomplete
 */

const get = async (req, res, prisma) => {
  const { groupScope } = req.query
  // get all tags for this group
  const tags = await prisma.tag.findMany({
    where: {
        group: {
            scope: groupScope,
        }
    },
  })

  res.status(200).json(tags)
}

export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(
          withPrisma(
            get
          )
      ), [Role.PROFESSOR]
  ),
})

