import { PrismaClient, Role, StudentAnswerStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'
import { hasRole } from '../../../../../../../../code/auth'
import { isInProgress } from '../utils'
import { grading } from '../../../../../../../../code/grading'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

const handler = async (req, res) => {
  let isProfOrStudent =
    (await hasRole(req, Role.PROFESSOR)) || (await hasRole(req, Role.STUDENT))

  if (!isProfOrStudent) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  switch (req.method) {
    case 'PUT':
      await put(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}

const put = async (req, res) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { jamSessionId, questionId, queryId } = req.query

  const { content } = req.body

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  const jamSessionToQuestion = await prisma.jamSessionToQuestion.findUnique({
    where: {
      jamSessionId_questionId: {
        jamSessionId: jamSessionId,
        questionId: questionId,
      },
    },
    include: {
      question: true,
    },
  })

  if (!jamSessionToQuestion) {
    res.status(400).json({ message: 'Question not found' })
    return
  }

  await prisma.$transaction(async (prisma) => {
    // update the status of the student answers
    await prisma.studentAnswer.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: {
        status: StudentAnswerStatus.SUBMITTED
      },
    })

    // update the student answers query for database question
    await prisma.studentAnswerDatabaseToQuery.update({
      where:{
        userEmail_questionId_queryId: {
          userEmail: studentEmail,
          questionId: questionId,
          queryId: queryId
        }
      },
      data:{
        query:{
          update: {
            content: content
          }
        }
      }
    });

    await prisma.studentQuestionGrading.upsert({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      create: {
        userEmail: studentEmail,
        questionId: questionId,
        ...grading(jamSessionToQuestion, undefined),
      },
      update: grading(jamSessionToQuestion, undefined),
    })
  });

  const updatedAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    select: {
      status: true,
      database: {
        select: {
          queries: {
            select: {
              query: true,
            },
          },
        },
      },
    },
  })

  res.status(200).json(updatedAnswer)
}

export default handler
