import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../middleware/withPrisma'

/** Managing the order of the questions in a collection */

const put = async (req, res, prisma) => {
  // update the order of the questions in the collection
  const { collectionToQuestions } = req.body

  // update the order of the questions in the collection
  for (const [_, collectionToQuestion] of collectionToQuestions.entries()) {
    await prisma.collectionToQuestion.update({
      where: {
        collectionId_questionId: {
          collectionId: collectionToQuestion.collectionId,
          questionId: collectionToQuestion.questionId,
        },
      },
      data: {
        order: collectionToQuestion.order,
      },
    })
  }

  res.status(200).json({ message: 'OK' })
}

export default withMethodHandler({
  PUT: withAuthorization(
    withPrisma(put), [Role.PROFESSOR]
  ),
})


