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
import ManageMultipleChoice from './type_specific/ManageMultipleChoice'
import CodeWriting from './type_specific/CodeWriting'
import TrueFalse from './type_specific/TrueFalse'
import Web from './type_specific/Web'
import Database from './type_specific/Database'
import Essay from './type_specific/Essay'
import ScrollContainer from '../layout/ScrollContainer'

const QuestionTypeSpecific = ({
  groupScope,
  question,
  onUpdate,
  onTypeSpecificChange,
}) => {
  const renderSpecificType = () => {
    switch (question.type) {
      case QuestionType.multipleChoice:
        return (
          <ManageMultipleChoice
            groupScope={groupScope}
            questionId={question.id}
            onUpdate={onUpdate}
          />
        )

      case QuestionType.code:
        return (
          <CodeWriting
            groupScope={groupScope}
            questionId={question.id}
            onUpdate={onUpdate}
          />
        )

      case QuestionType.database:
        return (
          <Database
            groupScope={groupScope}
            questionId={question.id}
            onUpdate={onUpdate}
          />
        )

      case QuestionType.trueFalse:
        if (question.trueFalse) {
          return (
            <TrueFalse
              isTrue={question.trueFalse.isTrue}
              onChange={(newIsTrue) =>
                onTypeSpecificChange(question.type, { isTrue: newIsTrue })
              }
            />
          )
        }
        break

      case QuestionType.web:
        if (question.web) {
          return (
            <Web
              web={question.web}
              onChange={(newWeb) => onTypeSpecificChange(question.type, newWeb)}
            />
          )
        }
        break
      case QuestionType.essay:
        if (question.essay) {
          return (
            <Essay
              title={'Solution Answer'}
              content={question.essay.solution}
              onChange={(newContent) =>
                onTypeSpecificChange(question.type, { solution: newContent })
              }
            />
          )
        }
      default:
        return null // or a default component or some feedback to the users
    }
  }

  return <ScrollContainer>{renderSpecificType()}</ScrollContainer>
}

export default QuestionTypeSpecific
