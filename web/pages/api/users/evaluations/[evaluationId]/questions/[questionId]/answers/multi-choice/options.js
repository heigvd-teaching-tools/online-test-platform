import { Role, StudentAnswerStatus } from '@prisma/client'

import { getSession } from 'next-auth/react'
import { isInProgress } from '../utils'
import { grading } from '@/code/grading'
import {
  withAuthorization,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

const addOrRemoveOption = async (req, res, prisma) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { evaluationId, questionId } = req.query

  const toAdd = req.method === 'POST'

  const { option } = req.body

  // get all options including their official answer status,
  // these are used to grade the users answers
  // WARNING! they should not be returned by the api to the users
  const evaluationToQuestion = await prisma.evaluationToQuestion.findUnique({
    where: {
      evaluationId_questionId: {
        evaluationId: evaluationId,
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

  if (!evaluationToQuestion) {
    res.status(400).json({ message: 'Internal Server Error' })
    return
  }

  if (!(await isInProgress(evaluationId, prisma))) {
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

  // update the status of the users answers
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

  // add option to users multi-choice answers
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

  // get the updated users answers
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

  // grade the users answers
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
      ...grading(evaluationToQuestion.question, evaluationToQuestion.points, studentAnswer),
    },
    update: grading(evaluationToQuestion.question,evaluationToQuestion.points, studentAnswer),
  })


  // get the updated users answers -> do not return the options official answer status "isCorerct"
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

export default withMethodHandler({
  POST: withAuthorization(
      withPrisma(addOrRemoveOption), [Role.PROFESSOR, Role.STUDENT]
  ),
  DELETE: withAuthorization(
      withPrisma(addOrRemoveOption), [Role.PROFESSOR, Role.STUDENT]
  )
})
