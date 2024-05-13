/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fs from 'fs/promises'
import path from 'path'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { runSandbox } from '@/sandbox/runSandboxTC'
import { CodeQuestionType, Role } from '@prisma/client'

async function migrateCodeQuestionsExpectedOutput(prisma) {
  // Select all Code questions of type codeWriting
  const codeQuestions = await prisma.code.findMany({
    where: {
      codeType: CodeQuestionType.codeWriting,
    },
    include: {
      codeWriting: {
        include: {
          testCases: true,
          solutionFiles: {
            include: {
              file: true,
            },
          },
        },
      },
      sandbox: true,
    },
  })

  for (const codeQuestion of codeQuestions) {
    if (!codeQuestion.codeWriting) continue // Skip if no codeWriting associated

    const { sandbox, codeWriting } = codeQuestion
    const { testCases } = codeWriting

    // Prepare sandbox execution parameters
    const sandboxParams = {
      image: sandbox.image,
      files: codeWriting.solutionFiles.map((sf) => sf.file), // Assuming solutionFiles is correctly related to files
      beforeAll: sandbox.beforeAll,
      tests: testCases,
    }

    // Execute the sandbox for the current question
    const result = await runSandbox(sandboxParams)

    // Update each test case with the new expected output from the sandbox result
    for (const testResult of result.tests) {
      // Find the corresponding test case by input
      const testCase = testCases.find((tc) => tc.input === testResult.input)
      if (!testCase) {
        console.warn(
          `No test case found with input '${testResult.input}' for questionId ${codeWriting.questionId}.`,
        )
        continue
      }

      try {
        await prisma.testCase.update({
          where: {
            index_questionId: {
              index: testCase.index,
              questionId: codeWriting.questionId,
            },
          },
          data: {
            expectedOutput: testResult.output, // Update the expected output with the sandbox output
          },
        })
      } catch (error) {
        console.error(
          `Error updating test case with input '${testResult.input}' for questionId ${codeWriting.questionId}:`,
          error,
        )
      }
    }
  }

  return true
}

const extractUrlsFromMarkdown = (markdown) => {
  const regexp = /\]\((http[s]?:\/\/.*?)(?="\)|\))/g
  const urls = []
  let match
  while ((match = regexp.exec(markdown)) !== null) {
    urls.push(match[1])
  }
  return urls
}

async function getFilesFromDirectory(directoryPath, basePath) {
  let fileList = []
  try {
    const files = await fs.readdir(directoryPath, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        const subDirFiles = await getFilesFromDirectory(
          path.join(directoryPath, file.name),
          basePath,
        )
        fileList = fileList.concat(subDirFiles)
      } else {
        // Ensure path normalization and trimming
        fileList.push(
          path
            .relative(basePath, path.join(directoryPath, file.name))
            .replace(/\\/g, '/'),
        )
      }
    }
  } catch (error) {
    console.error('Failed to read directory:', error)
    throw error
  }
  return fileList
}

async function cleanupUnusedUploads(prisma, domainName) {
  const uploadsBasePath = path.join(process.cwd(), 'public', 'uploads')

  const markdownFields = [
    // Combine content from different models, ensure each item is trimmed
    ...(await prisma.evaluation.findMany({ select: { conditions: true } })).map(
      (e) => e.conditions,
    ),
    ...(await prisma.question.findMany({ select: { content: true } })).map(
      (q) => q.content,
    ),
    ...(await prisma.essay.findMany({ select: { solution: true } })).map(
      (e) => e.solution,
    ),
    ...(
      await prisma.studentAnswerEssay.findMany({ select: { content: true } })
    ).map((sa) => sa.content),
  ]

  const referencedUrls = []
  markdownFields.forEach((field) => {
    extractUrlsFromMarkdown(field).forEach((url) => {
      if (url.startsWith(domainName)) {
        const relativePath = url
          .replace(domainName, '')
          .replace(/^\/+/, '')
          .trim() // Normalize and trim path
        referencedUrls.push(relativePath)
      }
    })
  })

  console.log('Referenced URLs: ', referencedUrls)

  const allFiles = await getFilesFromDirectory(uploadsBasePath, uploadsBasePath)
  console.log('All Files: ', allFiles)

  const filesToDelete = allFiles.filter((file) => {
    return !referencedUrls.some((url) => url.endsWith(file))
  })
  console.log('Files to delete: ', filesToDelete)

  // Delete unreferenced files
  for (let file of filesToDelete) {
    await fs.unlink(path.join(uploadsBasePath, file))
  }

  return {
    all: allFiles.length,
    deleted: filesToDelete.length,
    referenced: referencedUrls.length,
  }
}

const post = async (req, res, prisma) => {
  const { action, options } = req.body

  try {
    switch (action) {
      case 'run_all_sandboxes_and_update_expected_output':
        const done = await migrateCodeQuestionsExpectedOutput(prisma)
        res.status(200).json({ done })
        break
      case 'cleanup_unused_uploads':
        const { all, deleted, referenced } = await cleanupUnusedUploads(
          prisma,
          options.domain,
        )
        res.status(200).json({
          message: 'Cleanup successful',
          all,
          deleted,
          referenced,
        })
        break
      default:
        res.status(400).json({ error: 'Invalid action specified' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default withMethodHandler({
  POST: withAuthorization(withPrisma(post), [Role.SUPER_ADMIN]),
})
