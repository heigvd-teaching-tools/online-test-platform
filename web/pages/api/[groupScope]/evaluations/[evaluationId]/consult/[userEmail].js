import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { IncludeStrategy, questionIncludeClause } from '@/code/questions'
/*
  Professor can consult the users's answers to the questions of a evaluation
*/
const get = async (req, res, prisma) => {
    const { evaluationId, userEmail } = req.query

    const evaluation = await prisma.evaluation.findUnique({
        where: {
            id: evaluationId,
        },
        include: {
            evaluationToQuestions: {
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
    res.status(200).json(evaluation)

}

export default withMethodHandler({
  GET: withAuthorization(
    withPrisma(get), [Role.PROFESSOR]
  ),
})
