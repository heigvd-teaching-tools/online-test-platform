import { PrismaClient, Role, DatabaseQueryOutputType } from '@prisma/client'
import { hasRole } from '../../../../../../../../../code/auth'
import { getSession } from 'next-auth/react'
import { grading } from '../../../../../../../../../code/grading'
import {isInProgress} from "../../../../../../../jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils";
import {runSandboxDB} from "../../../../../../../../../sandbox/runSandboxDB";
import {runTestsOnDatasets} from "../../../../../../../../../code/database";

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
  const { queries, order } = req.body
  const studentEmail = session.user.email

  if(!order){
    res.status(400).json({ message: 'Order not provided' })
    return
  }

  if(!queries){
    res.status(400).json({ message: 'Queries not provided' })
    return
  }

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
    select: {
      question:{
        select:{
          database: {
            select: {
              image: true,
            }
          }
        }
      }
    }
  });

  if (!studentAnswer) {
    res.status(404).json({ message: 'Student answer not found' })
    return
  }

  const image = studentAnswer.question.database.image;

  const result = await runSandboxDB({
    image: image,
    queries: queries,
  });

  res.status(200).json({
    updatedAt: new Date(),
    output: result[order]
  });
}
