import { useState, useCallback } from 'react'
import { JamSessionPhase, Role } from '@prisma/client'
import useSWR from 'swr'

import { Stack, Typography } from '@mui/material'
import LayoutMain from '../../layout/LayoutMain'
import { useRouter } from 'next/router'
import { useSnackbar } from '../../../context/SnackbarContext'

import StepReferenceCollection from '../draft/StepReferenceCollection'
import StepGeneralInformation from '../draft/StepGeneralInformation'
import StepSchedule from '../draft/StepSchedule'

import JoinClipboard from '../JoinClipboard'
import { LoadingButton } from '@mui/lab'
import { update, create } from './crud'
import PhaseRedirect from './PhaseRedirect'
import Authorisation from '../../security/Authorisation'
import { fetcher } from '../../../code/utils'
import Loading from '../../feedback/Loading'
import BackButton from '../../layout/BackButton'

const PageDraft = () => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const { data: jamSession, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}`,
    jamSessionId ? fetcher : null,
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
  const [jamSessionQuestions, setJamSessionQuestions] = useState([])

  const onChangeReferenceCollection = useCallback(
    (collection) => {
      setSelectedCollection(collection)
    },
    [setSelectedCollection]
  )

  const onLoadQuestions = useCallback(
    (questions) => {
      setJamSessionQuestions(questions)
    },
    [setJamSessionQuestions]
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
      phase: JamSessionPhase.DRAFT,
      label: jamSession?.label,
      conditions: jamSession?.conditions,
      collectionId: selectedCollection?.id,
      duration,
    }

    const hasQuestions =
      (selectedCollection?.collectionToQuestions &&
        selectedCollection.collectionToQuestions.length > 0) ||
      jamSessionQuestions.length > 0

    if (!selectedCollection && !hasQuestions) {
      showSnackbar('Please select the reference collections.', 'error')
      setSaving(false)
      return false
    }

    if (!hasQuestions) {
      showSnackbar(
        'Your jam session has no questions. Please select the reference collection.',
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

    if (jamSession.id) {
      await update(jamSession.id, data)
        .then((response) => {
          if (response.ok) {
            showSnackbar('Jam session saved', 'success')
          } else {
            response.json().then((data) => {
              showSnackbar(data.message, 'error')
            })
          }
        })
        .catch(() => {
          showSnackbar('Error while saving jam session', 'error')
        })
    } else {
      await create(data)
        .then((response) => {
          if (response.ok) {
            response.json().then(async (data) => {
              await router.push(`/jam-sessions/${data.id}/draft`)
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
    jamSession,
    jamSessionQuestions,
    selectedCollection,
    duration,
    showSnackbar,
    router,
  ])

  const handleFinalize = useCallback(async () => {
    if (await handleSave()) {
      await router.push(`/jam-sessions`)
    }
  }, [router, handleSave])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading error={[error]} loading={!jamSession}>
        <PhaseRedirect phase={jamSession?.phase}>
          <LayoutMain 
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/jam-sessions`} />
                { jamSession.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {jamSession.label}
                  </Typography>
                )}
              </Stack>
            } 
            padding={2}
            >
              <Stack sx={{ width: '100%' }} spacing={4} pb={40}>
                {jamSession.id && (
                  <JoinClipboard jamSessionId={jamSession.id} />
                )}

                <StepReferenceCollection
                  disabled={jamSessionQuestions.length > 0}
                  jamSession={jamSession}
                  onChangeCollection={onChangeReferenceCollection}
                  onLoadQuestions={onLoadQuestions}
                />

                <StepGeneralInformation
                  jamSession={jamSession}
                  onChange={(data) => {
                    jamSession.label = data.label
                    jamSession.conditions = data.conditions
                  }}
                />

                <StepSchedule
                  jamSession={jamSession}
                  onChange={onDurationChange}
                />
                

                <Stack direction="row" justifyContent="space-between">
                  <LoadingButton
                    onClick={handleSave}
                    loading={saving}
                    variant="outlined"
                    color="info"
                  >
                    {jamSession.id ? 'Save' : 'Create'}
                  </LoadingButton>
                  {jamSession.id && (
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
