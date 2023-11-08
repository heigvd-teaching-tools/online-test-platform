import { Role } from '@prisma/client'
import {withAuthorization, withGroupScope, withMethodHandler} from '../../../../../../middleware/withAuthorization'
import { withPrisma } from '../../../../../../middleware/withPrisma'

const get = async (req, res) => {
  // get the code of the question
  const { questionId } = req.query
  const code = await prisma.code.findUnique({
    where: {
      questionId: questionId,
    },
  })

  res.status(200).json(code)
}


export default withMethodHandler({
  GET: withAuthorization(
      withGroupScope(withPrisma(get)), [Role.PROFESSOR]
  ),
})

