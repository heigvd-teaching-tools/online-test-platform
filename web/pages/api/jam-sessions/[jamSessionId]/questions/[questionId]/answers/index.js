import {
  PrismaClient,
  Role,
  StudentAnswerStatus,
  QuestionType,
} from '@prisma/client'

import { getSession } from 'next-auth/react'
import { hasRole } from '../../../../../../../code/auth'
import { isInProgress } from './utils'
import { grading } from '../../../../../../../code/grading'

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
    case 'GET':
      await get(req, res)
      break
    default:
      res.status(405).json({ message: 'Method not allowed' })
      break
  }
}

const get = async (req, res) => {
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { questionId } = req.query

  // get the student answers for a question including related nested data
  const studentAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    include: {
      question: {
        select: {
          // we only select multiple choice because we need the list of all options (not only those selected by the student)
          multipleChoice: {
            select: {
              options: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
      },
      code: {
        select: {
          files: {
            select: { studentPermission: true, file: true },
            orderBy: [
              { file: { createdAt: 'asc' } },
              { file: { questionId: 'asc' } },
            ],
          },
        },
      },
      multipleChoice: { select: { options: true } },
      trueFalse: true,
      essay: true,
      web: true,
    },
  })

  if (!studentAnswer) {
    res.status(404).json({ message: 'Student answers not found' })
    return
  }

  res.status(200).json(studentAnswer)
}

/*
 endpoint to handle student answers related to all single level question types (without complex nesting) [true false, essay, web]
*/
const put = async (req, res) => {
  // update student answers
  const session = await getSession({ req })
  const studentEmail = session.user.email
  const { jamSessionId, questionId } = req.query

  const { answer } = req.body
  const questionToJamSession = await prisma.jamSessionToQuestion.findUnique({
    where: {
      jamSessionId_questionId: {
        jamSessionId: jamSessionId,
        questionId: questionId,
      },
    },
    include: {
      question: {
        select: {
          type: true,
          trueFalse: true,
          essay: true,
          web: true,
        },
      },
    },
  })

  if (!(await isInProgress(jamSessionId))) {
    res.status(400).json({ message: 'Exam session is not in progress' })
    return
  }

  const status =
    answer === undefined
      ? StudentAnswerStatus.MISSING
      : StudentAnswerStatus.SUBMITTED

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

  // update the typeSpecific student answers

  const {
    answer: data,
    grading,
    model,
  } = prepareAnswer(questionToJamSession, answer)

  transaction.push(
    model.update({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      data: data,
    })
  )

  // update the grading
  transaction.push(
    prisma.studentQuestionGrading.upsert({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      create: {
        userEmail: studentEmail,
        questionId: questionId,
        ...grading,
      },
      update: grading,
    })
  )

  await prisma.$transaction(transaction)

  const updatedStudentAnswer = await prisma.studentAnswer.findUnique({
    where: {
      userEmail_questionId: {
        userEmail: studentEmail,
        questionId: questionId,
      },
    },
    select: {
      status: true,
      [questionToJamSession.question.type]: true,
    },
  })

  res.status(200).json(updatedStudentAnswer)
}

/*
    prepare the answers and grading for the student answers and select the correct model to update
    this function also insures that no other fields or related entities are changed by the client
*/
const prepareAnswer = (questionToJamSession, answer) => {
  const { question } = questionToJamSession
  switch (question.type) {
    case QuestionType.trueFalse:
      return {
        model: prisma.studentAnswerTrueFalse,
        answer: {
          isTrue: answer ? answer.isTrue : null,
        },
        grading: grading(questionToJamSession, answer),
      }
    case QuestionType.essay:
      return {
        model: prisma.studentAnswerEssay,
        answer: {
          content: answer ? String(answer.content) : null,
        },
        grading: grading(questionToJamSession, answer),
      }
    case QuestionType.web:
      return {
        model: prisma.studentAnswerWeb,
        answer: {
          css: answer ? answer.css : null,
          html: answer ? answer.html : null,
          js: answer ? answer.js : null,
        },
        grading: grading(questionToJamSession, answer),
      }
    default:
      return undefined
  }
}

export default handler
