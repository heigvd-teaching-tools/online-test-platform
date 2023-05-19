import { PrismaClient, Role } from '@prisma/client'
import { getUserSelectedGroup, hasRole } from '../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  switch (req.method) {
    case 'GET':
      await get(req, res)
      break
    case 'PUT':
      await put(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const get = async (req, res) => {
  const { questionId } = req.query

  // get all tags linked to this question
  const tags = await prisma.questionToTag.findMany({
    where: {
      questionId: questionId,
    },
    include: {
      tag: true,
    },
  })

  res.status(200).json(tags)
}

const put = async (req, res) => {
  const group = await getUserSelectedGroup(req)

  if (!group) {
    res.status(404).json({ message: 'Group not found' })
    return
  }

  const { tags } = req.body

  const { questionId } = req.query

  const transaction = [
    // unlink all tags from this question
    prisma.questionToTag.deleteMany({
      where: {
        questionId: questionId,
      },
    }),
    // create eventual new tags
    ...tags.map((tag) =>
      prisma.tag.upsert({
        where: {
          label: tag,
        },
        update: {},
        create: {
          label: tag,
          group: {
            connect: {
              id: group.id,
            },
          },
        },
      })
    ),
    // link all tags to this question
    ...tags.map((tag) =>
      prisma.questionToTag.create({
        data: {
          questionId: questionId,
          label: tag,
        },
      })
    ),
    // delete tags that are not linked to any question
    prisma.tag.deleteMany({
      where: {
        questionToTag: {
          none: {},
        },
        groupId: group.id,
      },
    }),
  ]

  const response = await prisma.$transaction(transaction)

  res.status(200).json(response)
}

export default handler
