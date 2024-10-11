/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { EvaluationPhase, Role } from '@prisma/client'
import { withPrisma } from '@/middleware/withPrisma'
import {
  withMethodHandler,
  withAuthorization,
  withGroupScope,
} from '@/middleware/withAuthorization'

const get = async (req, res, prisma) => {
  const { evaluationId } = req.query

  // Fetch registered students, their session details, and the evaluation phase
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      phase: true, // Get the current phase of the evaluation
      students: {
        select: {
          user: true,
          registeredAt: true,
          finishedAt: true,
          status: true,
          originalSessionToken: true,
          hasSessionChanged: true,
          sessionChangeDetectedAt: true,
        },
        orderBy: {
          registeredAt: 'asc',
        },
      },
    },
  })

  // If the evaluation is in progress, check for session changes
  let updatedRegistered = evaluation.students
  
  if (evaluation.phase === EvaluationPhase.IN_PROGRESS) {
    updatedRegistered = await Promise.all(
      evaluation.students.map(async (student) => {
        const currentSession = await prisma.session.findFirst({
          where: { userId: student.user.id },
          select: { sessionToken: true },
        })

        if(student.user.email === 'stefan.teofanovic@heig-vd.ch') {
          console.log("#### Session check", student.user.email, currentSession.sessionToken, student.originalSessionToken)
        }


        // If the current session token is different from the original, update the status
        if (
          currentSession &&
          currentSession.sessionToken !== student.originalSessionToken &&
          !student.hasSessionChanged
        ) {
          
          
          await prisma.userOnEvaluation.update({
            where: {
              userEmail_evaluationId: {
                userEmail: student.user.email,
                evaluationId,
              },
            },
            data: {
              hasSessionChanged: true,
              sessionChangeDetectedAt: new Date(),
            },
          })

          return {
            ...student,
            hasSessionChanged: true,
            sessionChangeDetectedAt: new Date(),
          }
        }

        return student
      }),
    )
  }
    

  // Fetch denied access attempts
  const denied = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
    select: {
      userOnEvaluationDeniedAccessAttempt: {
        select: {
          user: true,
          attemptedAt: true,
        },
        orderBy: {
          attemptedAt: 'asc',
        },
      },
    },
  })

  // Return both registered students and denied access attempts, with updated session info
  res.status(200).json({
    registered: updatedRegistered,
    denied: denied.userOnEvaluationDeniedAccessAttempt,
  })
}

export default withGroupScope(
  withMethodHandler({
    GET: withAuthorization(withPrisma(get), [Role.PROFESSOR]),
  }),
)
