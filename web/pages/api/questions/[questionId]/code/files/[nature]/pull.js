import { PrismaClient, Role, StudentPermission } from '@prisma/client'

import { hasRole } from '../../../../../../../code/auth'

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

// hanlder for POST

const handler = async (req, res) => {
  if (!(await hasRole(req, Role.PROFESSOR))) {
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

const post = async (req, res) => {
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

export default handler
