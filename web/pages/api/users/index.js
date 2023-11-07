import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'

/**
 * 
 * Search for professors users
 * Used by AutoComplete Search Component when adding a professor to a group
 */

const get = async (req, res, prisma) => {
  const { search } = req.query

  // find professors users that match the search query

  if (!search || search.length < 2) {
    res.status(200).json([])
    return
  }

  const users = await prisma.user.findMany({
    where: {
      role: Role.PROFESSOR,
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
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  })

  res.status(200).json(users)
}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
})
