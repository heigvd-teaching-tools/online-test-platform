import { Role } from '@prisma/client'
import { getSession } from 'next-auth/react'
import {isInProgress} from "@/pages/api/users/evaluations/[evaluationId]/questions/[questionId]/answers/utils";
import {runSandboxDB} from "@/sandbox/runSandboxDB";
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization';
import { withPrisma } from '@/middleware/withPrisma';

/*
 endpoint to run the database console query sandbox for a users
 */
const post = async (req, res, prisma) => {
  const session = await getSession({ req })

  const { evaluationId, questionId } = req.query
  const { query, at } = req.body
  const studentEmail = session.user.email

  if (at === undefined || at === null) {
    res.status(400).json({ message: 'At not provided' })
    return
   }

  if (!(await isInProgress(evaluationId, prisma))) {
    res.status(400).json({ message: 'evaluation is not in progress' })
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
              query: {
                select: {
                  content: true,
                }
              }
            },
            orderBy: {
              query: { order: 'asc' } ,
            }
          },
        }
      },
      question:{
        include:{
          database: {
            select:{
                image:true
            }
          }
        }
      }
    }
  })

  if (!studentAnswer) {
    res.status(404).json({ message: 'Student answer not found' })
    return
  }

  const image = studentAnswer.question.database.image;
  const sqlQueries = studentAnswer.database.queries.map(q => q.query.content);

  // add query to the list of queries
  sqlQueries.splice(at, 0, query);

  const result = await runSandboxDB({
    image: image,
    queries: sqlQueries,
  });

  if(!result[at]){
    // a query before the current one failed, find the last one that failed
    let i = at - 1;
    while(i >= 0){
        if(result[i]){
            break;
        }
        i--;
    }

    res.status(400).json(result[i]);
    return;

  }

  res.status(200).json(result[at]);
}

export default withMethodHandler({
  POST: withAuthorization(
    withPrisma(post), [Role.PROFESSOR, Role.STUDENT]
  ),
})
