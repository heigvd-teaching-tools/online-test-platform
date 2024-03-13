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
import { withQuestionUpdate } from '@/middleware/withQuestionUpdate'

/**
 *
 * Managing the options of a multichoice question
 * get: list options of a multichoice question
 * put: update an option of a multichoice question
 * post: create an option for a multichoice question
 * del: delete an option of a multichoice question
 */

// get the options of the multichoice question
const get = async (req, res, prisma) => {
  const { questionId } = req.query

  const multiChoice = await prisma.multipleChoice.findUnique({
    where: {
      questionId: questionId,
    },
    include: {
      options: {
        orderBy: {
          id: 'asc',
        },
      },
    },
  })

  res.status(200).json(multiChoice.options)
}

// update the option of the multichoice question
const put = async (req, res, prisma) => {
  const { questionId } = req.query
  const { option } = req.body

  // check if options belongs to the question
  const optionQuestion = await prisma.multipleChoice.findUnique({
    where: { questionId: questionId },
    include: {
      options: true,
    },
  })

  if (!optionQuestion.options.some((o) => o.id === option.id)) {
    res.status(404).json({ message: 'Option not found' })
    return
  }

  // update the option
  const updatedOption = await prisma.option.update({
    where: { id: option.id },
    data: {
      text: option.text,
      isCorrect: option.isCorrect,
    },
  })

  res.status(200).json(updatedOption)
}

// create a new option for the multichoice question
const post = async (req, res, prisma) => {
  const { questionId } = req.query
  const { option } = req.body

  // create the option
  const newOption = await prisma.option.create({
    data: {
      text: option.text,
      isCorrect: option.isCorrect,
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

  res.status(200).json({ message: 'Option deleted' })
}

export default withMethodHandler({
  GET: withAuthorization(withGroupScope(withPrisma(get)), [Role.PROFESSOR]),
  PUT: withAuthorization(withGroupScope(withQuestionUpdate(withPrisma(put))), [
    Role.PROFESSOR,
  ]),
  POST: withAuthorization(
    withGroupScope(withQuestionUpdate(withPrisma(post))),
    [Role.PROFESSOR]
  ),
  DELETE: withAuthorization(
    withGroupScope(withQuestionUpdate(withPrisma(del))),
    [Role.PROFESSOR]
  ),
})
