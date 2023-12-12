import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { getUser } from '@/code/auth';

/**
 * 
 * Search for users
 * Used by SuperAdmin page and  AutoComplete Search Component when adding a professor to a group
 */
const get = async (req, res, prisma) => {
  const { search, role } = req.query;

  if (!role) {
    // only super admin can view all users
    const user = await getUser(req, res);
    if (!user.roles.includes(Role.SUPER_ADMIN)) {
      //res.status(403).json({ message: 'Forbidden' });
      //return;
    }
  }

  const roleCondition = role && Role[role] ? {
    roles: {
      has: Role[role],
    },
  } : {};

  const searchCondition = search && search.length >= 2 ? {
    OR: [ // OR applies on the array of conditions
      {
        name: {
          contains: search,
        },
      },
      {
        email: {
          contains: search,
        },
      },
    ],
  } : {};

  const users = await prisma.user.findMany({
    where: {
      ...roleCondition,
      ...searchCondition,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      roles: true,
    },
  });

  res.status(200).json(users);
}


export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR, Role.SUPER_ADMIN]
  ),
})
