import { PrismaClient, Role, JamSessionPhase } from '@prisma/client'

import { getUserSelectedGroup, hasRole } from '../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  const isProf = await hasRole(req, Role.PROFESSOR)
  if (!isProf) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'GET':
      await get(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}


const get = async (req, res) => {
    const { jamSessionId } = req.query
    const jamSession = await prisma.jamSession.findUnique({
      where: {
        id: jamSessionId,
      },
      include: {
        students: {
          select: {
            user: true,
            registeredAt: true,
          },
        },
        jamSessionToQuestions: {
          select: {
            question: {
              select:{
                id: true,
                studentAnswer:{
                  select:{
                    question: {
                      select:{
                        id: true
                      }
                    },
                    userEmail: true,
                    status: true
                  }
                },
              },
            },
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        }
      },
    })
    res.status(200).json(jamSession)
  }
  
  export default handler