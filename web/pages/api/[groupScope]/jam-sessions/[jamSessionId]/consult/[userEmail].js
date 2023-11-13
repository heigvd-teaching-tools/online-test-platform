import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { IncludeStrategy, questionIncludeClause } from '@/code/questions'
/*
  Professor can consult the users's answers to the questions of a jam session
*/
const get = async (req, res, prisma) => {
    const { jamSessionId, userEmail } = req.query

    const jamSession = await prisma.jamSession.findUnique({
        where: {
            id: jamSessionId,

        },
        include: {
            jamSessionToQuestions: {
            include: {
                question: {
                    include: questionIncludeClause({
                        includeTypeSpecific: true,
                        includeOfficialAnswers: true,
                        includeUserAnswers: {
                            strategy: IncludeStrategy.USER_SPECIFIC,
                            userEmail: userEmail,
                        },
                        includeGradings: true,
                    }),
                },
            },
            orderBy: {
                order: 'asc',
            },
            },
        },
    });
    console.log("get called")
    res.status(200).json(jamSession)

}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
})
