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
import { EvaluationPhase, Role, UserOnEvaluatioAccessMode } from '@prisma/client'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Alert, AlertTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Tooltip, Typography } from '@mui/material'
import LayoutMain from '@/components/layout/LayoutMain'

import { useSnackbar } from '@/context/SnackbarContext'

import { LoadingButton } from '@mui/lab'

import { fetcher } from '@/code/utils'
import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'
import BackButton from '@/components/layout/BackButton'

import { update, create } from './crud'
import PhaseRedirect from './PhaseRedirect'
import JoinClipboard from '../JoinClipboard'
import StepReferenceCollection from '../draft/StepReferenceCollection'
import StepGeneralInformation from '../draft/StepGeneralInformation'
import StepSchedule from '../draft/StepSchedule'
import StudentList from '../draft/StudentList'
import TagsSelector from '@/components/input/TagsSelector'

const PageDraft = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const { data: evaluation, error } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
    {
      fallbackData: {
        id: undefined,
        label: '',
        conditions: '',
      },
    },
  )

  const [saving, setSaving] = useState(false)

  const [selectedCollection, setSelectedCollection] = useState(undefined)
  const [evaluationQuestions, setEvaluationQuestions] = useState([])

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
      showSnackbar(
        'Please provide a label for your evaluation.',
        'error',
      )
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
  ])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
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

              <StepAccessMode evaluation={evaluation} onChange={(accessMode) => {
                evaluation.accessMode = accessMode
              }} />

              

              <StepSchedule
                evaluation={evaluation}
                onChange={onDurationChange}
              />

             
              
              <StudentsInEvaluation groupScope={groupScope} evaluation={evaluation} />

             

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
    </Authorisation>
  )
}

const StepAccessMode = ({ evaluation, onChange }) => {
  console.log("evaluation?.accessMode", evaluation?.accessMode)
  const [accessMode, setAccessMode] = useState(evaluation?.accessMode)

  const [accessList, setAccessList] = useState([])

  useEffect(() => {
    onChange(accessMode)
  }, [accessMode, onChange])

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Access mode</Typography>
      <Stack spacing={2}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="accessMode"
            value={accessMode}
            onChange={(e) => setAccessMode(e.target.value)}
          >
            <Tooltip title="Everyone with the link can access the evaluation">
            <FormControlLabel
              value={UserOnEvaluatioAccessMode.LINK_ONLY}
              control={<Radio />}
              label="Everyone with the link"
            />
            </Tooltip>
            <Tooltip title="Only students with link and part of the access list can access the evaluation">
            <FormControlLabel
              value={UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST}
              control={<Radio />}
              label="Restricted to access list"
            />
            </Tooltip>
          </RadioGroup>
        </FormControl>
        { accessMode === UserOnEvaluatioAccessMode.LINK_AND_ACCESS_LIST &&
          (
            <>
            <Typography variant="body1">Provide a list of email addresses to restrict access to the evaluation.</Typography>
            <TagsSelector
              label="Access list"
              value={accessList}
              options={[]}
              validateTag={tag => {
                return tag.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
              }}
              formatTag={tag => {
                // Try to find an email address anywhere within the string
                const match = tag.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (match && match[0]) {
                  // If an email address is found, return it in lowercase
                  const email = match[0].toLowerCase();
                  return email;
                }
                // If no email address is found, return the tag as is, it will be invalid anyway            
                return tag;
              }}
              
              onChange={(emails) => setAccessList(emails)}
            />
            {
              accessList.length === 0 &&
              <Alert severity="warning">
                <AlertTitle>Access list is empty</AlertTitle>
                Please provide at least one email address to restrict access to the evaluation.
              </Alert>
            }

            {
              accessList.length > 0 &&
              <Alert severity="info">
                <AlertTitle>Access list</AlertTitle>
                <Typography variant="body1">
                  Access list contains {accessList.length} email addresses.
                </Typography>
              </Alert>
            }
            </>
          )
        }
        

      </Stack>
    </Stack>
  )
}

const STUDENTS_ACTIVE_PULL_INTERVAL = 1000

const StudentsInEvaluation = ({ groupScope, evaluation }) => {
  const { data: students, error: errorStudents } = useSWR(
    `/api/${groupScope}/evaluations/${evaluation.id}/students`,
    groupScope && evaluation?.id ? fetcher : null,
    { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL },
  )

  return (
    evaluation.id && (
      <Loading loading={!students} errors={[errorStudents]}>
        <StudentList
          title={`Registered students (${students?.students.length})`}
          students={students?.students}
        />
      </Loading>
    )
  )
}


export default PageDraft
