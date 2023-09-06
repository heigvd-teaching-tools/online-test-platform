import { PrismaClient, Role, StudentPermission } from '@prisma/client'
import { hasRole } from '../../../../../../../../code/auth'
import { runSandbox } from '../../../../../../../../sandbox/runSandboxTC'
import { getSession } from 'next-auth/react'
import { grading } from '../../../../../../../../code/grading'
import {isInProgress} from "../../../../../../jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils";

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

export default async function handler(req, res) {
  const isProf = await hasRole(req, Role.PROFESSOR)
  const IsStudent = await hasRole(req, Role.STUDENT)

  if (!(isProf || IsStudent)) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'POST':
      await post(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

/*
 endpoint to run the database sandbox for a student answers
 Only uses queries stored in the database
 */
const post = async (req, res) => {
  const session = await getSession({ req })

  const { jamSessionId, questionId } = req.query
  const studentEmail = session.user.email

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Jam session is not in progress' })
    return
  }

  const studentAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId:{
        userEmail: studentEmail,
        questionId: questionId,
      }
    },
    include: {
      database: {
        include: {
            queries: {
                include: {
                    query: true,
                }
            },
        }
      },
    }
  });

  if (!studentAnswer) {
    res.status(404).json({ message: 'Student answer not found' })
    return
  }

  // get eventual HIDDEN queries
  const jamSessiionQuestion = await prisma.jamSessionToQuestion.findUnique({
      where: {
        jamSessionId_questionId:{
            jamSessionId: jamSessionId,
            questionId: questionId,
        }
      },
      select: {
        question: {
          select: {
            database: {
              select: {
                queries: {
                  where: {
                    studentPermission: {
                      equals: StudentPermission.HIDDEN,
                    }
                  }
                }
              }
            }
          }
        }
      }
  });

  if(!jamSessiionQuestion) {
    res.status(404).json({ message: 'Jam session question not found' })
    return
  }

  const hiddenQueries = jamSessiionQuestion.question.database.queries;

  res.status(200).send(jamSessiionQuestion)
}
