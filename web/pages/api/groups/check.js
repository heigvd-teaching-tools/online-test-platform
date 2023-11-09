import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'
/**
 * Check the group existence
 * Used by the group creation form to check if a group with the given label already exists
 *
 * get: check if a group with the given label exists
 *
 */

const get = async (req, res, prisma) => {
  // Check if a group with the given label exists
  const { label, scope } = req.query

  const group = await prisma.group.findFirst({
    where: {
      OR: [
        { label: label },
        { scope: scope }
      ]
    }
  });

  console.log("group: ", group)

  if (group) {
      res.status(200).json({ exists: true })
  }else{
      res.status(200).json({ exists: false })
  }
}



export default withMethodHandler({
  GET: withAuthorization(
      withPrisma(get), [Role.PROFESSOR]
  ),
})

