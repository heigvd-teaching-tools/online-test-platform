import { Role } from '@prisma/client'
import { withAuthorization, withMethodHandler } from '../../../middleware/withAuthorization'
import { withPrisma } from '../../../middleware/withPrisma'

/** Managing the grading of a qstudent answer 
 * 
 * Used by the page JamSession Grading 
*/

const patch = async (req, res) => {
  const {
    grading: {
      questionId,
      userEmail,
      pointsObtained,
      comment,
      signedBy,
      status,
    },
  } = req.body

  const updatedGrading = await prisma.studentQuestionGrading.update({
    where: {
      userEmail_questionId: {
        userEmail: userEmail,
        questionId: questionId,
      },
    },
    data: {
      status: status,
      pointsObtained: parseFloat(pointsObtained),
      signedByUserEmail: signedBy ? signedBy.email : null,
      comment: comment,
    },
    include: {
      signedBy: true,
    },
  })

  res.status(200).json(updatedGrading)
}

export default withMethodHandler({
  PATCH: withAuthorization(
    withPrisma(patch), [Role.PROFESSOR]
  ),
})

