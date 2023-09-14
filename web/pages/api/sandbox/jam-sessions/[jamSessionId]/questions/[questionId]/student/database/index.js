import {PrismaClient, Role, DatabaseQueryOutputType, Prisma} from '@prisma/client'
import { hasRole } from '../../../../../../../../../code/auth'
import { getSession } from 'next-auth/react'
import { grading } from '../../../../../../../../../code/grading'
import {isInProgress} from "../../../../../../../jam-sessions/[jamSessionId]/questions/[questionId]/answers/utils";
import {runSandboxDB} from "../../../../../../../../../sandbox/runSandboxDB";
import {runTestsOnDatasets} from "../../../../../../../../../code/database";
import {runSQLFluffSandbox} from "../../../../../../../../../sandbox/runSQLFluffSandbox";

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

const getStudentAnswer = async (prisma, studentEmail, questionId) => {
  return await prisma.studentAnswer.findUnique({
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
              query: {
                include:{
                  queryOutputTests:true
                }
              },
              studentOutput:true,
            },
            orderBy: {
              query: { order: 'asc' } ,
            }
          },
        }
      },
      question:{
        include:{
          jamSession: true,
          database: {
            include:{
              solutionQueries: {
                include: {
                  query: {
                    select:{
                      order:true // we use order to map student query to solution query output
                    }
                  },
                  output:true
                }
              }
            }
          }
        }
      }
    }
  });
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

  const studentAnswer = await getStudentAnswer(prisma, studentEmail, questionId);

  if (!studentAnswer) {
    res.status(404).json({ message: 'Student answer not found' })
    return
  }

  const image = studentAnswer.question.database.image;
  const sqlQueries = studentAnswer.database.queries.map(q => q.query.content);

  const result = await runSandboxDB({
    image: image,
    queries: sqlQueries,
  });

  // update the student answwer with new query outputs
  await prisma.$transaction(async (prisma) => {
    const studentAnswerQueries = studentAnswer.database.queries;
    const solutionQueryOutputs = studentAnswer.question.database.solutionQueries;

    // for each student answer query, upsert the DatabaseQueryOutput in the database
    for (let i = 0; i < studentAnswerQueries.length; i++) {
        const query = studentAnswerQueries[i].query;
        const currentOutput = result[i];

        // eventually run the linter
        if(query.lintRules){
          let lintResult;

          try{
            // run the lint sandbox
            lintResult = await runSQLFluffSandbox({
              sql: query.content,
              sqlFluffRules: query.lintRules,
            });
          }catch (e) {
            console.log("Lint Sandbox Error", e);
          }

          // update the DatabaseQuery with the lint result
          await prisma.databaseQuery.update({
            where: {
              id: query.id,
            },
            data: {
              lintResult: !lintResult ? Prisma.JsonNull : lintResult
            }
          });

        }

        const studentAnswerDatabaseToQuery = await prisma.studentAnswerDatabaseToQuery.findUnique({
          where: {
            userEmail_questionId_queryId:{
              userEmail: studentEmail,
              questionId: questionId,
              queryId: query.id
            }
          },
          include: {
            studentOutput: true,
          }
        });

        const existingOutput = studentAnswerDatabaseToQuery.studentOutput;

        if(currentOutput){

          const outputData = {
            output: currentOutput,
            type: currentOutput.type,
            status: currentOutput.status,
          }

          // Eventually apply tests on test query outputs
          if(query.testQuery){
            let testPassed = false;
            const solutionOutput = solutionQueryOutputs.find(solQ => solQ.query.order === query.order).output.output;
            if(currentOutput.type === solutionOutput.type){
              switch(currentOutput.type){
                case DatabaseQueryOutputType.TEXT:
                  testPassed = currentOutput.result === solutionOutput.result;
                  break;
                case DatabaseQueryOutputType.SCALAR:
                case DatabaseQueryOutputType.TABULAR:
                  const tests = query.queryOutputTests.map(ot => ot.test)
                  testPassed = runTestsOnDatasets(solutionOutput.result, currentOutput.result, tests);
                  break;
              }
            }

            // include test results in the output
            outputData.output = {
              ...outputData.output,
              testPassed: testPassed,
            };
          }

          // we got output for the current query, update the student query output
          if(existingOutput){
            await prisma.databaseQueryOutput.update({
              where: {
                id: existingOutput.id,
              },
              data: {
                ...outputData,
              }
            })
          }else{
            // create new output and connect it to the solution query
            await prisma.databaseQueryOutput.create({
              data: {
                ...outputData,
                studentAnswer: {
                  connect: {
                    userEmail_questionId_queryId:{
                      userEmail: studentEmail,
                      questionId: questionId,
                      queryId: query.id
                    }
                  }
                },
                query: { // this relation is needed for the output to be deleted when the query is deleted
                  connect: {
                    id: query.id,
                  }
                }
              }
            })
          }
        }else{
          // some previous queries failed, lets delete the output of the next queries
          if(existingOutput){
            await prisma.databaseQueryOutput.delete({
              where: {
                  id: existingOutput.id,
              }
            })
          }
        }
    }

    // GRADING

    // get the student answers after the update
    const updatedStudentAnswer = await getStudentAnswer(prisma, studentEmail, questionId);

    // code questions grading
    await prisma.studentQuestionGrading.upsert({
      where: {
        userEmail_questionId: {
          userEmail: studentEmail,
          questionId: questionId,
        },
      },
      update: grading(
          studentAnswer.question,
          studentAnswer.question.jamSession.points,
          updatedStudentAnswer
      ),
      create: {
        userEmail: studentEmail,
        questionId: questionId,
        ...grading(
            studentAnswer.question,
            studentAnswer.question.jamSession.points,
            updatedStudentAnswer
        ),
      },
    })
  });



  const studentAnswerQueries = await prisma.studentAnswerDatabaseToQuery.findMany({
    where: {
      userEmail: studentEmail,
      questionId: questionId,
    },
    include: {
      studentOutput: true,
      query:{
        select:{
          lintResult:true
        }
      }
    },
    orderBy: {
      query: {
        order: 'asc'
      }
    }

  })

  if(!studentAnswerQueries) res.status(404).json({message: 'Not found'})

  res.status(200).json(studentAnswerQueries)
}
