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
import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import MultipleChoice from './MultipleChoice'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'
import { useDebouncedCallback } from 'use-debounce'
import { Box, Stack } from '@mui/system'
import {
  Alert,
  AlertTitle,
  Button,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import DropdownSelector from '@/components/input/DropdownSelector'
import AddIcon from '@mui/icons-material/Add'
import CheckboxLabel from '@/components/input/CheckboxLabel'
import UserHelpPopper from '@/components/feedback/UserHelpPopper'

const ManageMultipleChoice = ({ groupScope, questionId, onUpdate }) => {
  const {
    data: multipleChoice,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/questions/${questionId}/multiple-choice`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  const saveMultipleChoice = useCallback(
    async (multipleChoice) => {
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(multipleChoice),
        },
      )
        .then((data) => data.json())
        .then(async () => {
          await mutate()
        })
    },
    [groupScope, questionId, mutate],
  )

  const onPropertyChange = useCallback(
    async (property, value) => {
      multipleChoice[property] = value
      await saveMultipleChoice(multipleChoice)
      onUpdate && onUpdate()
    },
    [multipleChoice, saveMultipleChoice, onUpdate],
  )

  const onChangeOption = useCallback(
    async (newOption) => {
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            option: newOption,
          }),
        },
      )
        .then(async (res) => {
          if (res.status === 200) {
            await mutate()
          }
        })
        .finally(() => {
          onUpdate && onUpdate()
        })
    },
    [groupScope, questionId, mutate, onUpdate],
  )

  const onDeleteOption = useCallback(
    async (_, deletedOption) => {
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            option: deletedOption,
          }),
        },
      )
        .then(async (res) => {
          if (res.status === 200) {
            await mutate()
          }
        })
        .finally(() => {
          onUpdate && onUpdate()
        })
    },
    [groupScope, questionId, mutate, onUpdate],
  )

  const onAddOption = useCallback(async () => {
    await fetch(
      `/api/${groupScope}/questions/${questionId}/multiple-choice/options`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          option: {
            text: '',
            isCorrect: false,
            order: multipleChoice?.options.length,
          },
        }),
      },
    )
      .then(async (res) => {
        if (res.status === 200) {
          await mutate()
        }
      })
      .finally(() => {
        onUpdate && onUpdate()
      })
  }, [groupScope, questionId, mutate, onUpdate, multipleChoice?.options])

  const saveReOrder = useCallback(
    async (reordered) => {
      // save question order
      await fetch(
        `/api/${groupScope}/questions/${questionId}/multiple-choice/order`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            options: reordered,
          }),
        },
      )
    },
    [groupScope, questionId],
  )

  const debounceSaveOrdering = useDebouncedCallback(saveReOrder, 300)

  return (
    <Loading loading={!multipleChoice} errors={[error]}>
      <Stack spacing={2} mt={1}>
        <Stack
          direction="row"
          justifyContent={'space-between'}
          alignItems={'flex-start'}
          px={1}
        >
          <MultipleChoiceConfig
            multipleChoice={multipleChoice}
            onPropertyChange={onPropertyChange}
          />
        </Stack>

        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => onAddOption()}
          px={2}
        >
          Add Option
        </Button>

        <Stack px={2} spacing={2}>
          <MultipleChoice
            limiterActivated={multipleChoice?.activateSelectionLimit}
            options={multipleChoice?.options}
            onAdd={onAddOption}
            onChangeOption={async (newOption) => {
              await onChangeOption(newOption)
            }}
            onChangeOrder={async (reordered) => {
              await debounceSaveOrdering(reordered)
            }}
            onDelete={async (deletedIndex, deletedOption) => {
              await onDeleteOption(deletedIndex, deletedOption)
            }}
          />
        </Stack>
      </Stack>
    </Loading>
  )
}

const MultipleChoiceConfig = ({ multipleChoice, onPropertyChange }) => {
  const [activateStudentComment, setAllowStudentComment] = useState(
    multipleChoice?.activateStudentComment,
  )
  const [studentCommentLabel, setStudentCommentLabel] = useState(
    multipleChoice?.studentCommentLabel,
  )

  const [activateSelectionLimit, setActivateSelectionLimit] = useState(
    multipleChoice?.activateSelectionLimit,
  )

  useEffect(() => {
    setAllowStudentComment(multipleChoice?.activateStudentComment)
    setStudentCommentLabel(multipleChoice?.studentCommentLabel)
    setActivateSelectionLimit(multipleChoice?.activateSelectionLimit)
  }, [multipleChoice])

  const debounceOnPropertyChange = useDebouncedCallback(onPropertyChange, 500)

  return (
    <Stack flex={1} spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction="row" alignItems={'center'}>
          <CheckboxLabel
            label="Activate student comment"
            checked={activateStudentComment}
            onChange={(checked) => {
              setAllowStudentComment(checked)
              onPropertyChange('activateStudentComment', checked)
            }}
          />
          <UserHelpPopper>
            <Stack spacing={1} p={1}>
              <Alert severity="info" variant="outlined">
                <AlertTitle>Activate student comment</AlertTitle>
                <Typography variant="body2">
                  An input field will be displayed to the student to provide an
                  explanation for their answer.
                </Typography>
              </Alert>
              <Alert severity="info" variant="outlined">
                <AlertTitle>Student comment label</AlertTitle>
                <Typography variant="body2">
                  The label of the input field where the student will provide
                  their explanation.
                </Typography>
              </Alert>
            </Stack>
          </UserHelpPopper>
          <CheckboxLabel
            label="Activate selection limit"
            checked={activateSelectionLimit}
            onChange={(checked) => {
              setActivateSelectionLimit(checked)
              onPropertyChange('activateSelectionLimit', checked)
            }}
          />
          <UserHelpPopper>
            <Stack spacing={1} p={1}>
              <Alert severity="info" variant="outlined">
                <AlertTitle>Selection limit</AlertTitle>
                <Typography variant="body2">
                  The student wont be able to select more than the number of
                  correct options.
                </Typography>
                <Typography variant="body2">
                  The student will be informed how many options are expected.
                </Typography>
              </Alert>
            </Stack>
          </UserHelpPopper>
        </Stack>

        <DropdownSelector
          label={(option) => `Grading policy: ${option.label}`}
          size="small"
          value={'allOrNothing'}
          options={[
            { value: 'allOrNothing', label: 'All or Nothing' },
            { value: 'partial', label: 'Partial' },
          ]}
          onSelect={(value) => onPropertyChange('difficulty', value)}
        />
      </Stack>
      {activateStudentComment && (
        <TextField
          label="Student comment label"
          variant="standard"
          value={studentCommentLabel || 'Explain'}
          fullWidth
          size={'small'}
          onChange={(e) => {
            setStudentCommentLabel(e.target.value)
            debounceOnPropertyChange('studentCommentLabel', e.target.value)
          }}
          sx={{
            ml: 0.5,
          }}
        />
      )}
    </Stack>
  )
}

export default ManageMultipleChoice
