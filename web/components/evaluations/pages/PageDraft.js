import { useState, useCallback } from 'react'
import { EvaluationPhase, Role } from '@prisma/client'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Stack, Typography } from '@mui/material'
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

const PageDraft = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const { data: evaluation, error } = useSWR(
    `/api/${groupScope}/evaluation/${evaluationId}`,
      groupScope && evaluationId ? fetcher : null,
    {
      fallbackData: {
        id: undefined,
        label: '',
        conditions: '',
      },
    }
  )

  const [saving, setSaving] = useState(false)

  const [selectedCollection, setSelectedCollection] = useState(undefined)
  const [evaluationQuestions, setEvaluationQuestions] = useState([])

  const onChangeReferenceCollection = useCallback(
    (collection) => {
      setSelectedCollection(collection)
    },
    [setSelectedCollection]
  )

  const onLoadQuestions = useCallback(
    (questions) => {
      setEvaluationQuestions(questions)
    },
    [setEvaluationQuestions]
  )

  const [duration, setDuration] = useState(undefined)
  const onDurationChange = useCallback(
    (duration) => {
      setDuration(duration)
    },
    [setDuration]
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
        'Your evaluation has no questions. Please select the reference collection.',
        'error'
      )
      setSaving(false)
      return false
    }

    if (data.label.length === 0) {
      showSnackbar(
        'You collections session has no label. Please enter a label.',
        'error'
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
              await router.push(`/${groupScope}/evaluation/${data.id}/draft`)
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

  const handleFinalize = useCallback(async () => {
    if (await handleSave()) {
      await router.push(`/${groupScope}/evaluation`)
    }
  }, [groupScope, router, handleSave])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading error={[error]} loading={!evaluation}>
        <PhaseRedirect phase={evaluation?.phase}>
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/evaluation`} />
                { evaluation.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {evaluation.label}
                  </Typography>
                )}
              </Stack>
            }
            padding={2}
            >
              <Stack sx={{ width: '100%' }} spacing={4} pb={40}>
                {evaluation.id && (
                  <JoinClipboard evaluationId={evaluation.id} />
                )}

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

                <StepSchedule
                  groupScope={groupScope}
                  evaluation={evaluation}
                  onChange={onDurationChange}
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
                  {evaluation.id && (
                    <LoadingButton
                      onClick={handleFinalize}
                      loading={saving}
                      variant="contained"
                    >
                      Finalize
                    </LoadingButton>
                  )}
                </Stack>
              </Stack>
          </LayoutMain>
        </PhaseRedirect>
      </Loading>
    </Authorisation>
  )
}

export default PageDraft
