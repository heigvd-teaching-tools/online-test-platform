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
    case 'POST':
    case 'DELETE':
      await addOrRemoveOption(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
      break
  }
}

const addOrRemoveOption = async (req, res) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { jamSessionId, questionId } = req.query

  const toAdd = req.method === 'POST'

  const { option } = req.body

  // get all options including their official answer status, 
  // these are used to grade the student answers 
  // WARNING! they should not be returned by the api to the student
  const jamSessionToQuestion = await prisma.jamSessionToQuestion.findUnique({
    where: {
      jamSessionId_questionId: {
        jamSessionId: jamSessionId,
        questionId: questionId,
      },
    },
    include: {
      question: {
        include: {
          multipleChoice: {
            select: {
              options: true, 
              },
            },
          },
        },
      },
    })

  if (!jamSessionToQuestion) {
    res.status(400).json({ message: 'Internal Server Error' })
    return
  }

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  let status = StudentAnswerStatus.SUBMITTED

  if (!toAdd) {
    // toRemove
    // check if the option to remove is the only one selected, if so, set status to missing
    const studentAnswer = await prisma.studentAnswerMultipleChoice.findUnique({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      select: {
        options: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    })

    if (studentAnswer.options.length === 1) {
      status = StudentAnswerStatus.MISSING
    }
  }

  const transaction = [] // to do in single transaction, queries are done in order

  // update the status of the student answers
  transaction.push(
    prisma.studentAnswer.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: {
        status,
      },
    })
  )

  // add option to student multi-choice answers
  transaction.push(
    prisma.studentAnswerMultipleChoice.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: {
        options: {
          [toAdd ? 'connect' : 'disconnect']: {
            id: option.id,
          },
        },
      },
    })
  )

  // prisma transaction
  await prisma.$transaction(transaction)

  // get the updated student answers
  const studentAnswer = await prisma.studentAnswerMultipleChoice.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    select: {
      options: {
        select: {
          id: true,
          text: true,
        },
      },
    },
  })

  // grade the student answers
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
      ...grading(jamSessionToQuestion.question, jamSessionToQuestion.points, studentAnswer),
    },
    update: grading(jamSessionToQuestion.question,jamSessionToQuestion.points, studentAnswer),
  })


  // get the updated student answers -> do not return the options official answer status "isCorerct"
  const updatedStudentAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    select: {
      status: true,
      multipleChoice: {
        include: {
          options: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  })

  res.status(200).json(updatedStudentAnswer)
}

export default handler
