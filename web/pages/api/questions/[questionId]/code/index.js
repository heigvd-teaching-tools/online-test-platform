import { PrismaClient, Role } from '@prisma/client'

import { hasRole } from '../../../../../code/auth'

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
    default:
  }
}
const get = async (req, res) => {
  // get the code of the question
  const { questionId } = req.query
  const code = await prisma.code.findUnique({
    where: {
      questionId: questionId,
    },
  })

  res.status(200).json(code)
}

export default handler
