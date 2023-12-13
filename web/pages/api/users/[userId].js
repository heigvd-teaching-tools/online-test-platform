import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

/**
 * 
 * Update the roles of the user
 */
const patch = async (req, res, prisma) => {
  const { roles } = req.body;

  const { userId } = req.query;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  // check if roles are valid
  if (roles) {
    const validRoles = Object.keys(Role).map((key) => Role[key]);
    if(roles.filter((role) => !validRoles.includes(role)).length > 0) {
      res.status(400).json({ message: 'Invalid roles' });
      return;
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roles,
    },
  });

  res.status(200).json(updatedUser);
}


export default withMethodHandler({
  PATCH: withAuthorization(
    withPrisma(patch), [Role.SUPER_ADMIN]
  ),
})
