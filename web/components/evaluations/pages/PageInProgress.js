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
import { useCallback, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { EvaluationPhase, Role } from '@prisma/client'
import { update } from './crud'

import {
  Stack,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  AlertTitle,
  Tooltip,
  Button,
} from '@mui/material'

import { useSnackbar } from '@/context/SnackbarContext'
import { fetcher } from '@/code/utils'
import LayoutMain from '@/components/layout/LayoutMain'
import BackButton from '@/components/layout/BackButton'
import Loading from '@/components/feedback/Loading'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import Authorisation from '@/components/security/Authorisation'

import { LoadingButton } from '@mui/lab'

import JoinClipboard from '../JoinClipboard'
import StepInProgress from '../in-progress/StepInProgress'
import DisplayPhase from '../DisplayPhase'

import PhaseRedirect from './PhaseRedirect'
import StudentList from '../draft/StudentList'
import FilledBullet from '@/components/feedback/FilledBullet'
import DeniedStudentsInEvaluation from '../draft/DeniedStudentsInEvaluation'

const STUDENTS_ACTIVE_PULL_INTERVAL = 10000

const PageInProgress = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false)

  const {
    data: evaluation,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
  )

  const {
    data: students,
    error: errorStudents,
    mutate: mutateStudents,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/students`,
    groupScope && evaluationId ? fetcher : null,
    { refreshInterval: STUDENTS_ACTIVE_PULL_INTERVAL },
  )

  const [saving, setSaving] = useState(false)

  const handleEndInProgress = () => {
    setEndSessionDialogOpen(true)
  }

  const moveToGradingPhase = useCallback(async () => {
    setSaving(true)
    await update(groupScope, evaluation.id, {
      phase: EvaluationPhase.GRADING,
    })
      .then(async () => {
        await router.push(
          `/${groupScope}/evaluations/${evaluation.id}/grading/1`,
        )
      })
      .catch(() => {
        showSnackbar('Error', 'error')
      })
    setSaving(false)
  }, [groupScope, evaluation, router, showSnackbar])

  const handleDurationChange = useCallback(
    async (newEndAt) => {
      // get time from newEndAt date
      const time = new Date(newEndAt).toLocaleTimeString()
      setSaving(true)
      await update(groupScope, evaluation.id, {
        endAt: newEndAt,
      })
        .then(async (reponse) => {
          if (reponse.ok) {
            mutate(await reponse.json(), false)
            showSnackbar(`evaluation will end at ${time}`)
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
    [groupScope, evaluation, showSnackbar, mutate],
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!evaluation} errors={[error]}>
        <PhaseRedirect phase={evaluation?.phase}>
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/evaluations`} />
                {evaluation?.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {evaluation.label}
                  </Typography>
                )}
              </Stack>
            }
            padding={2}
            spacing={2}
          >
            <JoinClipboard evaluationId={evaluationId} />

            <StepInProgress
              evaluation={evaluation}
              onDurationChange={handleDurationChange}
              onEvaluationEnd={() => {}}
            />

            <Stack direction="row" justifyContent="center" spacing={1}>
              <a
                href={`/${groupScope}/evaluations/${evaluationId}/analytics`}
                key="analytics"
                target="_blank"
              >
                <Tooltip title="Open live analytics in a new tab">
                  <Button
                    key={'analytics'}
                    component="span"
                    color="info"
                    startIcon={
                      <Image
                        alt="Analytics"
                        src="/svg/icons/analytics.svg"
                        width="18"
                        height="18"
                      />
                    }
                  >
                    Live Analytics
                  </Button>
                </Tooltip>
              </a>

              <DisplayPhase phase={EvaluationPhase.IN_PROGRESS} />

              <LoadingButton
                key="promote-to-grading"
                onClick={handleEndInProgress}
                loading={saving}
                color="info"
                startIcon={
                  <Image
                    alt="Promote"
                    src="/svg/icons/finish.svg"
                    width="18"
                    height="18"
                  />
                }
              >
                End evaluation
              </LoadingButton>
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <FilledBullet state={'filled'} />
              <Typography variant="body2">Submitted answer</Typography>
              <FilledBullet state={'half'} />
              <Typography variant="body2">In-progress answer</Typography>
              <FilledBullet state={'empty'} />
              <Typography variant="body2">Missing answer</Typography>
            </Stack>
            <DeniedStudentsInEvaluation
              groupScope={groupScope}
              evaluation={evaluation}
              onStudentAllowed={async (_) => {
                mutateStudents()
                showSnackbar('Student has been included in the access list')
              }}
            />
            <Loading loading={!students} errors={[errorStudents]}>
              <StudentList
                groupScope={groupScope}
                evaluationId={evaluationId}
                title={'Students submissions'}
                students={students?.students}
                questions={students?.evaluationToQuestions}
                onChange={() => mutateStudents()}
              />
            </Loading>

            <DialogFeedback
              open={endSessionDialogOpen}
              title="End of In-Progress phase"
              content={
                <>
                  <Typography variant="body1">
                    You are about to promote this evaluation to the grading
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
