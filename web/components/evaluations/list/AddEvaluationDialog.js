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
import { useRouter } from 'next/router'
import { Autocomplete, Stack, TextField, Typography } from '@mui/material'

import { useSnackbar } from '@/context/SnackbarContext'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import { use, useEffect, useState } from 'react'
import CardSelector from '@/components/input/CardSelector'
import { EvaluationPhase, UserOnEvaluationAccessMode } from '@prisma/client'
import ToggleWithLabel from '@/components/input/ToggleWithLabel'
import UserHelpPopper from '@/components/feedback/UserHelpPopper'

const Presets = [
  {
    value: 'evaluation',
    label: 'Evaluation',
    description: 'For exams and any formal assessments',
    settings: {
      showSolutionWhenFinished: false,
      restrictAccess: true,
      grade: true,
    },
  },
  {
    value: 'training',
    label: 'Training',
    description: 'For homework and training purposes',
    settings: {
      showSolutionWhenFinished: true,
      restrictAccess: false,
      grade: false,
    },
  },
  {
    value: 'from_existing',
    label: 'Based on existing',
    description: 'Chose an existing evaluation as a template',
    settings: {},
  },
]

const AddEvaluationDialog = ({ existingEvaluations, open, onClose }) => {
  const router = useRouter()

  const { groupScope } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [preset, setPreset] = useState('evaluation')

  const [templateEvaluation, setTemplateEvaluation] = useState(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    setTemplateEvaluation(null)
  }, [preset])

  const handleAdd = async () => {
    await fetch(`/api/${groupScope}/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        preset: Presets.find((p) => p.value === preset),
        templateEvaluation: templateEvaluation,
      }),
    }).then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          showSnackbar('Evaluation created successfully', 'success')
          onClose()
          router.push(`/${groupScope}/evaluations/${data.id}`)
        } else {
          showSnackbar(data.message, 'error')
        }
      })
    })
  }

  const handleChange = (preset) => {
    setPreset(preset)
  }

  const getPresetSettings = (preset) => {
    if (preset === 'from_existing') {
      const selected = existingEvaluations.find(
        (e) => e.id === templateEvaluation?.id,
      )
      if (!selected) {
        return null
      } else {
        return {
          showSolutionWhenFinished: selected.showSolutionsWhenFinished,
          restrictAccess:
            selected.accessMode ===
            UserOnEvaluationAccessMode.LINK_AND_ACCESS_LIST,
          grade: selected.grade || true,
        }
      }
    }
    return Presets.find((p) => p.value === preset).settings
  }

  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title="Create a new evaluation"
      content={
        <Stack spacing={2} sx={{ width: '550px' }}>
          <Typography variant="body1">
            Please select the type of evaluation you want to create
          </Typography>
          <CardSelector
            options={Presets}
            selected={preset}
            onSelect={handleChange}
          />

          {preset === 'from_existing' && (
            <Autocomplete
              id="evaluation-id"
              inputValue={input}
              options={existingEvaluations || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Find the evaluation to use as a template"
                  error={!templateEvaluation}
                  helperText={
                    templateEvaluation ? '' : 'Please select an evaluation'
                  }
                />
              )}
              noOptionsText="No evaluations found"
              onInputChange={(_, value) => setInput(value)}
              onChange={(_, value) => {
                setTemplateEvaluation(value)
              }}
            />
          )}

          <Stack spacing={1}>
            {preset !== 'from_existing' ? (
              <Typography variant="h6">Selected preset details</Typography>
            ) : (
              <Typography variant="h6">Selected evaluation details</Typography>
            )}
            <PresetSummary preset={getPresetSettings(preset)} />

            <EvaluationSummary
              evaluation={existingEvaluations.find(
                (e) => e.id === templateEvaluation?.id,
              )}
            />
          </Stack>
        </Stack>
      }
      onConfirm={handleAdd}
    />
  )
}

const EvaluationSummary = ({ evaluation }) => {
  // Check if evaluation exists
  if (!evaluation) return null

  const hasQuestions = Boolean(evaluation.evaluationToQuestions?.length)

  const countMissingQuestions =
    evaluation.phase !== EvaluationPhase.DRAFT
      ? evaluation.evaluationToQuestions.filter(
          (q) => !q.question?.sourceQuestionId,
        ).length
      : 0

  const hasAccessList =
    evaluation.accessMode === UserOnEvaluationAccessMode.LINK_AND_ACCESS_LIST ||
    Boolean(evaluation.accessList?.length)

  const hasConditions = Boolean(evaluation.conditions?.length)

  return (
    <>
      {hasAccessList && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            The access list contains{' '}
            <b>{evaluation.accessList.length} students</b>
          </Typography>
        </Stack>
      )}

      {hasQuestions && (
        <Typography variant="body2">
          Contains <b>{evaluation.evaluationToQuestions.length} questions</b>.
        </Typography>
      )}

      {countMissingQuestions > 0 && (
        <Typography variant="body2" color={'error'}>
          <b>{countMissingQuestions} questions</b> used in this evaluation no
          longer exist in the question bank
        </Typography>
      )}

      {countMissingQuestions === 0 && (
        <Typography variant="body2" color={'info'}>
          All questions are still available in the question bank
        </Typography>
      )}

      {hasConditions && (
        <Typography variant="body2">Conditions are set</Typography>
      )}
    </>
  )
}

const PresetSummary = ({ preset }) => {
  return (
    preset && (
      <>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            Show the solution when finished:
          </Typography>
          <Typography variant="body1">
            {preset.showSolutionWhenFinished ? 'Yes' : 'No'}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Restricted Access:</Typography>
          <Typography variant="body1">
            {preset.restrictAccess ? 'Yes' : 'No'}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            Grade the evaluation and provide feedback:
          </Typography>
          <Typography variant="body1">{preset.grade ? 'Yes' : 'No'}</Typography>
        </Stack>
      </>
    )
  )
}

export default AddEvaluationDialog
