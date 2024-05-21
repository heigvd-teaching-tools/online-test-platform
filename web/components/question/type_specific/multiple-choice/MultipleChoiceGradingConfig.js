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
import { MultipleChoiceGradingPolicyType } from '@prisma/client'
import MultipleChoiceGradualCreditPolicy from './MultipleChoiceGradualCreditPolicy'
import { useEffect, useState } from 'react'
import ConfigPopper from '@/components/layout/utils/ConfigPopper'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import DropdownSelector from '@/components/input/DropdownSelector'

const gradingPolicyTypes = [
  {
    value: MultipleChoiceGradingPolicyType.ALL_OR_NOTHING,
    label: 'All or Nothing',
  },
  {
    value: MultipleChoiceGradingPolicyType.GRADUAL_CREDIT,
    label: 'Gradual Credit',
  },
]

const MultipleChoiceGradingConfig = ({
  groupScope,
  questionId,
  multipleChoice,
  onPropertyChange,
  onUpdate,
}) => {
  const [gradingPolicy, setGradingPolicy] = useState(
    multipleChoice?.gradingPolicy,
  )

  useEffect(() => {
    setGradingPolicy(multipleChoice?.gradingPolicy)
  }, [multipleChoice])

  return (
    <ConfigPopper
      color="info"
      placement="left-start"
      width={700}
      label={
        <Typography variant="body2">
          Grading policy{' '}
          <b>
            {
              gradingPolicyTypes.find((type) => type.value === gradingPolicy)
                ?.label
            }
          </b>
        </Typography>
      }
    >
      <Stack spacing={1}>
        <DropdownSelector
          label={(option) => `Grading policy: ${option.label}`}
          size="small"
          color="info"
          value={gradingPolicy}
          options={gradingPolicyTypes}
          onSelect={(value) => {
            setGradingPolicy(value)
            onPropertyChange('gradingPolicy', value)
          }}
        />

        {gradingPolicy === MultipleChoiceGradingPolicyType.GRADUAL_CREDIT && (
          <MultipleChoiceGradualCreditPolicy
            groupScope={groupScope}
            questionId={questionId}
            onUpdate={() => onUpdate()}
          />
        )}

        {gradingPolicy === MultipleChoiceGradingPolicyType.ALL_OR_NOTHING && (
          <Alert severity="info">
            <AlertTitle>All or Nothing</AlertTitle>
            <Typography variant="body1">
              All or Nothing awards full points if all correct options are
              selected and no incorrect options are selected.
            </Typography>
          </Alert>
        )}
      </Stack>
    </ConfigPopper>
  )
}

export default MultipleChoiceGradingConfig
