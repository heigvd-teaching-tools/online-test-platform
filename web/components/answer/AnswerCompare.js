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
import { QuestionType } from '@prisma/client'
import { Paper } from '@mui/material'
import { ResizeObserverProvider } from '@/context/ResizeObserverContext'

import CompareCode from './CompareCode'
import CompareWeb from './CompareWeb'
import CompareEssay from './CompareEssay'
import CompareMultipleChoice from './CompareMultipleChoice'
import CompareTrueFalse from './CompareTrueFalse'
import CompareDatabase from './CompareDatabase'

const AnswerCompare = ({ questionType, solution, answer }) => {
  return (
    <Paper
      square
      elevation={0}
      sx={{ flex: 1, height: '100%', overflowX: 'auto', p: 0 }}
    >
      {(answer &&
        ((questionType === QuestionType.trueFalse && (
          <CompareTrueFalse
            mode="compare"
            solution={solution.isTrue}
            answer={answer.isTrue}
          />
        )) ||
          (questionType === QuestionType.multipleChoice && answer.options && (
            <CompareMultipleChoice
              options={solution.options}
              answer={answer.options}
            />
          )) ||
          (questionType === QuestionType.essay && (
            <CompareEssay solution={solution} answer={answer.content} />
          )) ||
          (questionType === QuestionType.code && (
            <ResizeObserverProvider>
              <CompareCode solution={solution} answer={answer} />
            </ResizeObserverProvider>
          )) ||
          (questionType === QuestionType.web && (
            <CompareWeb solution={solution} answer={answer} />
          )))) ||
        (questionType === QuestionType.database && (
          <CompareDatabase solution={solution} answer={answer} />
        ))}
    </Paper>
  )
}

export default AnswerCompare
