import { Role } from '@prisma/client'
import {
  withAuthorization,
  withGroupScope,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'

const put = async (req, res, prisma) => {
  // update a file for a code question
  // as the file is created for a code question we handle it through CodeToFile entity

  const { questionId, nature, fileId } = req.query
  const {
    studentPermission,
    file: { path, content },
  } = req.body

  const model =
    nature === 'solution'
      ? prisma.codeToSolutionFile
      : prisma.codeToTemplateFile

  const newStudentPermission =
    nature === 'template' ? { studentPermission: studentPermission } : {}

  const codeToFile = await model.update({
    where: {
      questionId_fileId: {
        questionId,
        fileId,
      },
    },
    data: {
      ...newStudentPermission, // only applies to template files
      file: {
        update: {
          path,
          content,
        },
      },
    },
  })

  if (!codeToFile) {
    res.status(404).json({ message: 'Not found' })
    return
  }

  const file = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      path,
      content,
    },
  })

  res.status(200).json(file)
}

const del = async (req, res, prisma) => {
  // delete a file for a code question, cascade from codeToFile wont work here
  // as the file is created for a code question we handle it through CodeToFile entity

  const { questionId, nature, fileId } = req.query

  const model =
    nature === 'solution'
      ? prisma.codeToSolutionFile
      : prisma.codeToTemplateFile

  const codeToFile = await model.findUnique({
    where: {
      questionId_fileId: {
        questionId,
        fileId: fileId,
      },
    },
  })

  if (!codeToFile) {
    res.status(404).json({ message: 'Not found' })
    return
  }

  await prisma.$transaction(async (prisma) => {
    // decrement order for all files with order > codeToFile.order

    await model.updateMany({
      where: {
        questionId,
        order: {
          gt: codeToFile.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    })

    await prisma.file.delete({
      where: {
        id: fileId,
      },
    })
  })

  res.status(200).json({ message: 'Deleted' })
}

export default withMethodHandler({
  PUT: withAuthorization(
      withGroupScope(withPrisma(put)), [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
      withGroupScope(withPrisma(del)), [Role.PROFESSOR]
  )
})
