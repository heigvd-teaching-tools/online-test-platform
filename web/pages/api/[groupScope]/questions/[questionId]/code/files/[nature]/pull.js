import { Role, StudentPermission } from '@prisma/client'

import {
  withAuthorization,
  withGroupScope,
  withMethodHandler
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withQuestionUpdate } from '@/middleware/withQuestionUpdate'

/**
 *
 * Pull the solution files from the code question to the template files
 * Pull deletes any existing template files and replaces them with the solution files
 */

const post = async (req, res, prisma) => {
  // copy solution files to template files

  const { questionId, nature } = req.query

  if (nature !== 'solution') {
    res.status(400).json({ message: 'Bad request' })
    return
  }

  const codeToFiles = await prisma.codeToSolutionFile.findMany({
    where: {
      questionId,
    },
    include: {
      file: true,
    },
  })

  if (!codeToFiles) res.status(404).json({ message: 'Not found' })


  const newCodeToFiles = []

  await prisma.$transaction(async (prisma) => {

      /*
        delete any existing template files, there is no ownership relation between codeToTemplateFile and file
        so we have to select the files first and then delete them
      */

      const filesToDelete = await prisma.codeToTemplateFile.findMany({
        where: { questionId },
        include: {
          file: true,
        },
      })

      for (const file of filesToDelete) {
        await prisma.file.delete({
          where: {
            id: file.file.id,
          },
        })
      }
      // create new template files
      for (const codeToFile of codeToFiles) {
        let newCodeToFile = await prisma.codeToTemplateFile.create({
          data: {
            studentPermission: StudentPermission.UPDATE,
            order: codeToFile.order,
            file: {
              create: {
                path: codeToFile.file.path,
                content: codeToFile.file.content,
                code: {
                  connect: { questionId },
                },
              },
            },
            code: {
              connect: {
                questionId,
              },
            },
          },
          include: {
            file: true,
          },
        })
        newCodeToFiles.push(newCodeToFile)
      }
  });

  res.status(200).json(newCodeToFiles || [])
}


export default withMethodHandler({
  POST: withAuthorization(
      withGroupScope(withQuestionUpdate(withPrisma(post))), [Role.PROFESSOR]
  )
})
