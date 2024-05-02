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
import { useState, useCallback, useEffect } from 'react'
import {
  EvaluationPhase,
  Role,
  UserOnEvaluatioAccessMode,
} from '@prisma/client'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  Stack,
  Typography,
} from '@mui/material'
import LayoutMain from '@/components/layout/LayoutMain'

import { useSnackbar } from '@/context/SnackbarContext'

import { LoadingButton } from '@mui/lab'

import { fetcher } from '@/code/utils'
import Authorization from '@/components/security/Authorization'
import Loading from '@/components/feedback/Loading'
import BackButton from '@/components/layout/BackButton'

import { update, create } from './crud'
import PhaseRedirect from './PhaseRedirect'
import JoinClipboard from '../JoinClipboard'
import StepReferenceCollection from '../draft/StepReferenceCollection'
import StepGeneralInformation from '../draft/StepGeneralInformation'
import StepSchedule from '../draft/StepSchedule'
import StudentList from '../draft/StudentList'
import StepAccessMode from '../draft/StepAccessMode'
import DeniedStudentsInEvaluation from '../draft/DeniedStudentsInEvaluation'

const PageDraft = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const {
    data: evaluation,
    error,
    mutate,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
    {
      fallbackData: {
        id: undefined,
        label: '',
        conditions: '',
        accessMode: UserOnEvaluatioAccessMode.LINK_ONLY,
        accessList: [],
      },
    },
  )

  const [saving, setSaving] = useState(false)

  const [selectedCollection, setSelectedCollection] = useState(undefined)
  const [evaluationQuestions, setEvaluationQuestions] = useState([])

  const [accessMode, setAccessMode] = useState(
    UserOnEvaluatioAccessMode.LINK_ONLY,
  )
  const [accessList, setAccessList] = useState([])

  useEffect(() => {
    if (evaluation && evaluation.id) {
      setAccessMode(evaluation.accessMode)
      setAccessList(evaluation.accessList)
    }
  }, [evaluation])

  const onChangeReferenceCollection = useCallback(
    (collection) => {
      setSelectedCollection(collection)
    },
    [setSelectedCollection],
  )

  const onLoadQuestions = useCallback(
    (questions) => {
      setEvaluationQuestions(questions)
    },
    [setEvaluationQuestions],
  )

  const [duration, setDuration] = useState(undefined)
  const onDurationChange = useCallback(
    (duration) => {
      setDuration(duration)
    },
    [setDuration],
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    let data = {
      phase: EvaluationPhase.DRAFT,
      label: evaluation?.label,
      conditions: evaluation?.conditions,
      collectionId: selectedCollection?.id,
      accessMode: accessMode,
      accessList: accessList,
      duration,
    }

    const hasQuestions =
      (selectedCollection?.collectionToQuestions &&
        selectedCollection.collectionToQuestions.length > 0) ||
      evaluationQuestions.length > 0

    if (!selectedCollection && !hasQuestions) {
      showSnackbar('Please select the reference collections.', 'error')
      setSaving(false)
      return false
    }

    if (!hasQuestions) {
      showSnackbar(
        'Please select the reference collection that contain questions.',
        'error',
      )
      setSaving(false)
      return false
    }

    if (data.label.length === 0) {
      showSnackbar('Please provide a label for your evaluation.', 'error')
      setSaving(false)
      return false
    }

    if (evaluation.id) {
      await update(groupScope, evaluation.id, data)
        .then((response) => {
          if (response.ok) {
            showSnackbar('evaluation saved', 'success')
          } else {
            response.json().then((data) => {
              showSnackbar(data.message, 'error')
            })
          }
        })
        .catch(() => {
          showSnackbar('Error while saving evaluation', 'error')
        })
    } else {
      await create(groupScope, data)
        .then((response) => {
          if (response.ok) {
            response.json().then(async (data) => {
              await router.push(`/${groupScope}/evaluations/${data.id}/draft`)
            })
          } else {
            response.json().then((data) => {
              showSnackbar(data.message, 'error')
            })
          }
        })
        .catch(() => {
          showSnackbar('Error while saving collections session', 'error')
        })
    }
    setSaving(false)
    return true
  }, [
    evaluation,
    evaluationQuestions,
    selectedCollection,
    duration,
    showSnackbar,
    router,
    groupScope,
    accessMode,
    accessList,
  ])

  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading error={[error]} loading={!evaluation}>
        <PhaseRedirect phase={evaluation?.phase}>
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/evaluations`} />
                {evaluation.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {evaluation.label}
                  </Typography>
                )}
              </Stack>
            }
            padding={2}
          >
            <Stack sx={{ width: '100%' }} spacing={4} pb={40}>
              {evaluation.id && <JoinClipboard evaluationId={evaluation.id} />}

              <StepReferenceCollection
                groupScope={groupScope}
                disabled={evaluationQuestions.length > 0}
                evaluation={evaluation}
                onChangeCollection={onChangeReferenceCollection}
                onLoadQuestions={onLoadQuestions}
              />

              <StepGeneralInformation
                evaluation={evaluation}
                onChange={(data) => {
                  evaluation.label = data.label
                  evaluation.conditions = data.conditions
                }}
              />

              <StepAccessMode
                accessList={accessList}
                accessMode={accessMode}
                onChange={(accessMode, accessList) => {
                  setAccessMode(accessMode)
                  setAccessList(accessList)
                }}
              />

              <StepSchedule
                evaluation={evaluation}
                onChange={onDurationChange}
              />

              <StudentsInEvaluation
                groupScope={groupScope}
                evaluation={evaluation}
                restrictedAccess={accessMode === UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST}
                accessList={accessList}
                onStudentAllowed={() => {
                  mutate()
                  showSnackbar('Student has been included in the access list')
                }}
              />

              <DeniedStudentsInEvaluation
                groupScope={groupScope}
                evaluation={evaluation}
                onStudentAllowed={async (_) => {
                  mutate()
                  showSnackbar('Student has been included in the access list')
                }}
              />

              <Stack direction="row" justifyContent="space-between">
                <LoadingButton
                  onClick={handleSave}
                  loading={saving}
                  variant="outlined"
                  color="info"
                >
                  {evaluation.id ? 'Save' : 'Create'}
                </LoadingButton>
              </Stack>
            </Stack>
          </LayoutMain>
        </PhaseRedirect>
      </Loading>
    </Authorization>
  )
}

const STUDENTS_ACTIVE_PULL_INTERVAL = 1000

const StudentsInEvaluation = ({ groupScope, evaluation, restrictedAccess, accessList, onStudentAllowed }) => {
  const { data: students, error: errorStudents, mutate } = useSWR(
    `/api/${groupScope}/evaluations/${evaluation.id}/students`,
    groupScope && evaluation?.id ? fetcher : null,
    { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL },
  )

  return (
    evaluation.id && (
      <Loading loading={!students} errors={[errorStudents]}>
        <StudentList
          groupScope={groupScope}
          title={`Registered students (${students?.students.length})`}
          evaluationId={evaluation.id}
          students={students?.students}
          restrictedAccess={restrictedAccess}
          accessList={accessList}
          onStudentAllowed={()=>{
            onStudentAllowed()
            mutate()
          }}
        />
      </Loading>
    )
  )
}

export default PageDraft
