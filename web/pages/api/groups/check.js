import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
/**
 * Check the group existence
 * Used by the group creation form to check if a group with the given label already exists
 *
 * get: check if a group with the given label exists
 *
 */

const get = async (req, res, prisma) => {
  const { label, scope, groupId } = req.query;

  let whereClause = {
    OR: [
      { label: label },
      { scope: scope }
    ]
  };

  if (groupId) { // update mode
    whereClause = {
      ...whereClause,
      NOT: { id: groupId }
    };
  }

  const group = await prisma.group.findFirst({
    where: whereClause
  });

  if (group) {
    res.status(200).json({ exists: true });
  } else {
    res.status(200).json({ exists: false });
  }
}




export default withMethodHandler({
  GET: withAuthorization(
      withPrisma(get), [Role.PROFESSOR]
  ),
})

