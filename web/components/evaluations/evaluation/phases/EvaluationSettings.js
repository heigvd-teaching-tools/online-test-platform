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
import { useSnackbar } from '@/context/SnackbarContext'
import { Alert, IconButton, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import SettingsAccessMode from './settings/SettingsAccessMode'
import SettingsSchedule from './settings/SettingsSchedule'
import StatusDisplay from '@/components/feedback/StatusDisplay'

const EvaluationSettings = ({ groupScope, evaluation, onSettingsChanged }) => {
  const { show: showSnackbar } = useSnackbar()

  const [label, setLabel] = useState(
    evaluation && evaluation.label ? evaluation.label : '',
  )

  const [conditions, setConditions] = useState(
    evaluation && evaluation.conditions ? evaluation.conditions : '',
  )

  useEffect(() => {
    if (evaluation) {
      setLabel(evaluation.label)
      setConditions(evaluation.conditions)
    }
  }, [evaluation, setLabel])

  const handleSave = useCallback(
    async (updatedProperties) => {
      return fetch(`/api/${groupScope}/evaluations/${evaluation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updatedProperties),
      })
        .then((response) => {
          if (response.ok) {
            onSettingsChanged()
          }

          response.json().then((data) => {
            showSnackbar(data.message, 'error')
          })
        })
        .catch(() => {
          showSnackbar('Error while saving evaluation', 'error')
        })
    },
    [evaluation.id, groupScope, onSettingsChanged, showSnackbar],
  )

  const debounceSave = useDebouncedCallback((updatedProperties) => {
    handleSave(updatedProperties)
  }, 750)

  return (
    <Stack spacing={2} px={1}>
      <EvaluationTitleBar title="Evaluation settings" />

      <Alert severity="info">
        <Typography variant="body2">
          A meaningful name of the evaluation. It will be displayed to the
          students.
        </Typography>
      </Alert>

      <TextField
        label="Label"
        id="evaluation-label"
        fullWidth
        value={label}
        size="small"
        onChange={(e) => {
          setLabel(e.target.value)
          debounceSave({ label: e.target.value })
        }}
        helperText={!label ? 'Label is required' : ''}
      />

      <Alert severity="info">
        <Typography variant="body2">
          Toggle the visibility of the solution for the students.
        </Typography>
        <Typography variant="body2">
          The students will be able to view the solution after the evaluation is
          completed. Thus, they can compare their solution with the correct one.
        </Typography>
        <Typography variant="body2">
          This setting is useful for evaluations that are used for learning /
          training purposes.
        </Typography>
      </Alert>

      <ConsultationSettings
        evaluation={evaluation}
        onChange={(consultationEnabled, showSolutionsWhenFinished) => {
          debounceSave({
            consultationEnabled,
            showSolutionsWhenFinished,
          })
        }}
      />

      <ConditionSettings
        groupScope={groupScope}
        conditions={conditions}
        onChange={(conditions) => {
          debounceSave({ conditions })
        }}
      />

      <SettingsAccessMode
        accessMode={evaluation.accessMode}
        accessList={evaluation.accessList}
        onChange={(accessMode, accessList) => {
          debounceSave({ accessMode, accessList })
        }}
      />

      <SettingsSchedule
        active={evaluation.durationActive}
        duration={{
          hours: evaluation.durationHours,
          minutes: evaluation.durationMins,
        }}
        onChange={(duration) => {
          debounceSave({
            durationActive: duration.active,
            durationHours: duration.hours,
            durationMins: duration.minutes,
          })
        }}
      />
    </Stack>
  )
}

import EditIcon from '@mui/icons-material/Edit'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import MarkdownEditor from '@/components/input/markdown/MarkdownEditor'
import EvaluationTitleBar from '../layout/EvaluationTitleBar'
import ConsultationSettings from '../../grading/ConsultationSettings'

const ConditionSettings = ({ groupScope, conditions, onChange }) => {
  const [conditionsEditing, setConditionsEditing] = useState(false)

  return (
    <>
      <Typography variant="h5">Conditions</Typography>
      <Alert severity="info">
        <Typography variant="body2">
          Used to specify the requirements and any rules or information for the
          students.
        </Typography>
        <Typography variant="body2">
          These may include prerequisites for participation, grading criteria,
          submission deadlines, attendance policies, or any other rules that
          ensure clarity and structure for the students.
        </Typography>
      </Alert>
      <Stack spacing={1} direction={'row'} alignItems={'center'}>
        {conditions ? (
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <StatusDisplay status={'SUCCESS'} />
            <Typography variant="caption">
              Conditions are set, length: {conditions.length}
            </Typography>
            <IconButton
              variant="text"
              color={'info'}
              size="small"
              onClick={() => setConditionsEditing(!conditionsEditing)}
            >
              <EditIcon />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <StatusDisplay status={'MISSING'} />
            <Typography variant="caption">No conditions set</Typography>
            <IconButton
              onClick={() => setConditionsEditing(!conditionsEditing)}
              size="small"
              color={'info'}
            >
              <EditIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>
      <UpdateConditionsDialog
        groupScope={groupScope}
        conditions={conditions}
        open={conditionsEditing}
        onClose={() => setConditionsEditing(false)}
        onConditionsChanged={(value) => {
          onChange(value)
        }}
      />
    </>
  )
}

const UpdateConditionsDialog = ({
  groupScope,
  conditions,
  open,
  onClose,
  onConditionsChanged,
}) => {
  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title="Update conditions"
      content={
        <Stack spacing={2} width={`80vw`} height={`70vh`}>
          <MarkdownEditor
            id={`conditions`}
            title="Conditions"
            groupScope={groupScope}
            rawContent={conditions}
            onChange={(value) => {
              onConditionsChanged(value)
            }}
          />
        </Stack>
      }
    />
  )
}

export default EvaluationSettings
