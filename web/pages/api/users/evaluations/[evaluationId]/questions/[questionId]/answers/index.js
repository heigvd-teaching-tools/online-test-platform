import {
  Role,
  StudentAnswerStatus,
  StudentPermission,
  QuestionType,
  EvaluationPhase,
  UserOnEvaluationStatus,
} from '@prisma/client'

import { isInProgress } from './utils'
import { grading } from '@/code/grading'
import {
  withAuthorization,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withEvaluationPhase, withStudentStatus } from '@/middleware/withStudentEvaluation'
import { getUser } from '@/code/auth'


/*
  get the users answers for a question including related nested data

*/
const get = withEvaluationPhase([EvaluationPhase.IN_PROGRESS], withStudentStatus([UserOnEvaluationStatus.IN_PROGRESS],
  async (req, res, prisma) => {
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { questionId } = req.query

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
              database:{
                select:{
                  solutionQueries: {
                    where: {
                      query: {
                        testQuery: true,
                      },
                    },
                    select: {
                      query: {
                        select:{
                          order:true // we use order to map users query to solution query output
                        }
                      },
                      output:true
                    }
                  }
                }
              }
            },
          },
          code: {
            select: {
              files: {
                where: {
                  studentPermission: {
                    not: StudentPermission.HIDDEN
                  }},
                select: { studentPermission: true, order: true, file: true },
                orderBy: { order: 'asc' },
              },
            },
          },
          database: {
            select: {
              queries: {
                include: {
                  query: {
                    include:{
                        queryOutputTests: true,
                    }
                  },
                  studentOutput: true,
                },
                orderBy: {
                  query: { order: 'asc' } ,
                }
              }
            }
          },
          multipleChoice: { select: { options: {
            select: {
              id: true,
              text: true,
            },
          } } },
          trueFalse: true,
          essay: true,
          web: true,
        },
      })

      if (!studentAnswer) {
        res.status(404).json({ message: 'Student answers not found' })
        return
      }

      if(studentAnswer.database){
        // remove hidden queries content
        studentAnswer.database.queries = studentAnswer.database?.queries.map(saTq => ({
            ...saTq,
            query: {
                ...saTq.query,
                content: saTq.query.studentPermission === StudentPermission.HIDDEN ? null : saTq.query.content
            }
        }))
      }

      res.status(200).json(studentAnswer)
    }
  )
)

/*
 endpoint to handle users answers related to all single level question types (without complex nesting)
 ONLY : [true false, essay, web]
 The complexe question types have their own endpoints
*/
const put = withEvaluationPhase([EvaluationPhase.IN_PROGRESS], withStudentStatus([UserOnEvaluationStatus.IN_PROGRESS],
  async (req, res, prisma) => {
      // update users answers
      const user = await getUser(req, res)
      const studentEmail = user.email
      const { evaluationId, questionId } = req.query

      const { answer } = req.body
      const questionToEvaluation = await prisma.evaluationToQuestion.findUnique({
        where: {
          evaluationId_questionId: {
            evaluationId: evaluationId,
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

      if (!(await isInProgress(evaluationId, prisma))) {
        res.status(400).json({ message: 'Exam session is not in progress' })
        return
      }

      const status =
        answer === undefined
          ? StudentAnswerStatus.MISSING
          : StudentAnswerStatus.IN_PROGRESS

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

      // update the typeSpecific users answers

      const {
        answer: data,
        grading,
        model,
      } = prepareAnswer(prisma, questionToEvaluation, answer)

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
          [questionToEvaluation.question.type]: true,
        },
      })

      res.status(200).json(updatedStudentAnswer)
    }
))

/*
    prepare the answers and grading for the users answers and select the correct model to update
    this function also insures that no other fields or related entities are changed by the client
*/
const prepareAnswer = (prisma, questionToEvaluation, answer) => {
  const { question } = questionToEvaluation
  switch (question.type) {
    case QuestionType.trueFalse:
      return {
        model: prisma.studentAnswerTrueFalse,
        answer: {
          isTrue: answer ? answer.isTrue : null,
        },
        grading: grading(question, questionToEvaluation.points, answer),
      }
    case QuestionType.essay:
      return {
        model: prisma.studentAnswerEssay,
        answer: {
          content: answer ? String(answer.content) : null,
        },
        grading: grading(question, questionToEvaluation.points, answer),
      }
    case QuestionType.web:
      return {
        model: prisma.studentAnswerWeb,
        answer: {
          css: answer ? answer.css : null,
          html: answer ? answer.html : null,
          js: answer ? answer.js : null,
        },
        grading: grading(question, questionToEvaluation.points, answer),
      }
    default:
      return undefined
  }
}

export default withMethodHandler({
  PUT: withAuthorization(
      withPrisma(put), [Role.STUDENT, Role.PROFESSOR]
  ),
  GET: withAuthorization(
      withPrisma(get), [Role.STUDENT, Role.PROFESSOR]
  ),
})
