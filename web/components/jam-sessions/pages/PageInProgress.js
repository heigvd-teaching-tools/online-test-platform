import { useCallback, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { JamSessionPhase, Role } from '@prisma/client'
import { update } from './crud'

import { Stack, Stepper, Step, StepLabel, Typography, Alert, AlertTitle, Tooltip, Button } from '@mui/material'

import { useSnackbar } from '../../../context/SnackbarContext'

import JoinClipboard from '../JoinClipboard'
import StepInProgress from '../in-progress/StepInProgress'
import LayoutMain from '../../layout/LayoutMain'
import { LoadingButton } from '@mui/lab'

import DisplayPhase from '../DisplayPhase'
import DialogFeedback from '../../feedback/DialogFeedback'
import PhaseRedirect from './PhaseRedirect'
import Authorisation from '../../security/Authorisation'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'
import StudentList from '../draft/StudentList'
import BackButton from '../../layout/BackButton'

const STUDENTS_ACTIVE_PULL_INTERVAL = 10000;

const PageInProgress = () => {
  const router = useRouter()
  const { groupScope, jamSessionId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false)

  const {
    data: jamSession,
    mutate,
    error,
  } = useSWR(
      `/api/${groupScope}/jam-sessions/${jamSessionId}`,
      groupScope && jamSessionId ? fetcher : null
      )


  const {
    data: students,
    error: errorStudents,
  } = useSWR(
      `/api/${groupScope}/jam-sessions/${jamSessionId}/students`,
      groupScope && jamSessionId ? fetcher : null,
      { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL}
      )


  const [saving, setSaving] = useState(false)

  const handleEndInProgress = () => {
    setEndSessionDialogOpen(true)
  }

  const moveToGradingPhase = useCallback(async () => {
    setSaving(true)
    await update(groupScope, jamSession.id, {
      phase: JamSessionPhase.GRADING,
    })
      .then(async () => {
        await router.push(`/${groupScope}/jam-sessions/${jamSession.id}/grading/1`)
      })
      .catch(() => {
        showSnackbar('Error', 'error')
      })
    setSaving(false)
  }, [groupScope, jamSession, router, showSnackbar])

  const handleDurationChange = useCallback(
    async (newEndAt) => {
      // get time from newEndAt date
      const time = new Date(newEndAt).toLocaleTimeString()
      setSaving(true)
      await update(groupScope, jamSession.id, {
        endAt: newEndAt,
      })
        .then(async (reponse) => {
          if (reponse.ok) {
            mutate(await reponse.json(), false)
            showSnackbar(`Jam session will end at ${time}`)
          } else {
            reponse.json().then((json) => {
              showSnackbar(json.message, 'error')
            })
          }
        })
        .catch(() => {
          showSnackbar('Error during duration change', 'error')
        })
      setSaving(false)
    },
    [groupScope, jamSession, showSnackbar, mutate]
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!jamSession} errors={[error]}>
        <PhaseRedirect phase={jamSession?.phase}>
            <LayoutMain
              hideLogo
              header={
                <Stack direction="row" alignItems="center">
                  <BackButton backUrl={`/${groupScope}/jam-sessions`} />
                  { jamSession?.id && (
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {jamSession.label}
                    </Typography>
                  )}
                </Stack>
              }
              padding={2}
              spacing={2}
              >

              <JoinClipboard jamSessionId={jamSessionId} />
              <Stepper activeStep={0} orientation="vertical">
                <Step key="in-progress">
                  <StepInProgress
                    jamSession={jamSession}
                    onDurationChange={handleDurationChange}
                    onJamSessionEnd={() => {}}
                  />
                </Step>
                <Step key="grading">
                  <StepLabel>Grading</StepLabel>
                </Step>
              </Stepper>

              <Stack direction="row" justifyContent="center" spacing={1}>

                <a href={`/${groupScope}/jam-sessions/${jamSessionId}/analytics`} key="analytics" target="_blank">
                  <Tooltip title="Open live analytics in a new tab">
                      <Button
                        key={"analytics"}
                        component="span"
                        color="info"
                        startIcon={
                          <Image
                            alt="Analytics"
                            src="/svg/icons/analytics.svg"
                            layout="fixed"
                            width="18"
                            height="18"
                          />
                        }
                      >
                        Live Analytics
                      </Button>
                  </Tooltip>
                </a>

                <DisplayPhase phase={JamSessionPhase.IN_PROGRESS} />

                <LoadingButton
                  key="promote-to-grading"
                  onClick={handleEndInProgress}
                  loading={saving}
                  color="info"
                  startIcon={
                    <Image
                      alt="Promote"
                      src="/svg/icons/finish.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                  }
                >
                  End jam session
                </LoadingButton>

              </Stack>

              <Alert severity={'info'}>
                <AlertTitle>Students submissions</AlertTitle>
                <Typography variant="body1">
                  The filled bullet point indicate the student has started working on the related question.
                </Typography>
              </Alert>
              <Loading loading={!students} errors={[errorStudents]}>
                <StudentList
                  title={"Students submissions"}
                  students={students?.students}
                  questions={students?.jamSessionToQuestions}
                />
              </Loading>

              <DialogFeedback
                open={endSessionDialogOpen}
                title="End of In-Progress phase"
                content={
                  <>
                    <Typography variant="body1">
                      You are about to promote this jam session to the grading
                      phase.
                    </Typography>
                    <Typography variant="body1">
                      Students will not be able to submit their answers anymore.
                    </Typography>
                    <Typography variant="button" gutterBottom>
                      Are you sure you want to continue?
                    </Typography>
                  </>
                }
                onClose={() => setEndSessionDialogOpen(false)}
                onConfirm={moveToGradingPhase}
              />
            </LayoutMain>
        </PhaseRedirect>
      </Loading>
    </Authorisation>
  )
}

export default PageInProgress
