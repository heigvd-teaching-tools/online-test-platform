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
import { Role } from '@prisma/client'

import {
  withAuthorization,
  withGroupScope,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { withPrisma } from '@/middleware/withPrisma'
import { withQuestionUpdate } from '@/middleware/withUpdate'

/**
 *
 * Managing the options of a multichoice question
 * put: update an option of a multichoice question
 * post: create an option for a multichoice question
 * del: delete an option of a multichoice question
 */

// update the option of the multichoice question
const put = async (req, res, prisma) => {
  const { questionId } = req.query
  const { option } = req.body

  // check if options belongs to the question
  const multipleChoice = await prisma.multipleChoice.findUnique({
    where: { questionId: questionId },
    include: {
      options: true,
    },
  })

  if (!multipleChoice.options.some((o) => o.id === option.id)) {
    res.status(404).json({ message: 'Option not found' })
    return
  }

  let updatedOption = null
  await prisma.$transaction(async (prisma) => {
    // update the option
    updatedOption = await prisma.option.update({
      where: { id: option.id },
      data: {
        text: option.text,
        isCorrect: option.isCorrect,
      },
    })

    if (multipleChoice.activateSelectionLimit) {
      // update the selectionLimit
      const countCorrectOptions = await prisma.option.count({
        where: {
          multipleChoice: {
            questionId: questionId,
          },
          isCorrect: true,
        },
      })

      await prisma.multipleChoice.update({
        where: { questionId: questionId },
        data: {
          selectionLimit: countCorrectOptions,
        },
      })
    }
    
  })
  res.status(200).json(updatedOption)
}

// create a new option for the multichoice question
const post = async (req, res, prisma) => {
  const { questionId } = req.query
  const { option } = req.body

  // count the existing options to determine the order
  const countOptions = await prisma.option.count({
    where: {
      multipleChoice: {
        questionId: questionId,
      },
    },
  })

  // create the option
  const newOption = await prisma.option.create({
    data: {
      text: option.text,
      isCorrect: option.isCorrect,
      order: countOptions, // use the count as the new order
      multipleChoice: {
        connect: {
          questionId: questionId,
        },
      },
    },
  })

  res.status(200).json(newOption)
}

const del = async (req, res, prisma) => {
  const { questionId } = req.query
  const { option } = req.body

  // check if options belongs to the question
  const optionQuestion = await prisma.multipleChoice.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      options: true,
    },
  })

  if (!optionQuestion.options.some((o) => o.id === option.id)) {
    res.status(404).json({ message: 'Option not found' })
    return
  }

  // delete the option
  await prisma.option.delete({
    where: {
      id: option.id,
    },
  })

  // reorder the remaining options
  const remainingOptions = await prisma.option.findMany({
    where: {
      multipleChoice: {
        questionId: questionId,
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  await prisma.$transaction(async (prisma) => {
    await Promise.all(
      remainingOptions.map((o, index) =>
        prisma.option.update({
          where: { id: o.id },
          data: { order: index },
        }),
      ),
    )

    // update the selectionLimit if the deleted option was correct
    if (option.isCorrect && optionQuestion.activateSelectionLimit) {
    
      const countCorrectOptions = await prisma.option.count({
        where: {
          multipleChoice: {
            questionId: questionId,
          },
          isCorrect: true,
        },
      })

      await prisma.multipleChoice.update({
        where: { questionId: questionId },
        data: {
          selectionLimit: countCorrectOptions,
        },
      })
    }
  })

  res.status(200).json({ message: 'Option deleted and reordered' })
}

export default withMethodHandler({
  PUT: withAuthorization(withGroupScope(withQuestionUpdate(withPrisma(put))), [
    Role.PROFESSOR,
  ]),
  POST: withAuthorization(
    withGroupScope(withQuestionUpdate(withPrisma(post))),
    [Role.PROFESSOR],
  ),
  DELETE: withAuthorization(
    withGroupScope(withQuestionUpdate(withPrisma(del))),
    [Role.PROFESSOR],
  ),
})
