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
import useSWR from 'swr'
import { getPhaseDetails } from '../evaluation/phases'
import { fetcher } from '@/code/utils'
import Authorization from '@/components/security/Authorization'
import Loading from '@/components/feedback/Loading'
import LayoutMain from '@/components/layout/LayoutMain'
import { Stack } from '@mui/system'
import BackButton from '@/components/layout/BackButton'
import { Typography } from '@mui/material'
import DisplayPhase from '../DisplayPhase'
import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import EvaluationSideMenu from '../evaluation/layout/EvaluationSideMenu'
import EvaluationActionMenu from '../evaluation/layout/EvaluationActionMenu'
import EvaluationSettings from '../evaluation/phases/EvaluationSettings'
import EvaluationComposition from '../evaluation/phases/EvaluationComposition'
import EvaluationAttendance from '../evaluation/phases/EvaluationAttendance'
import EvaluationInProgress from '../evaluation/phases/EvaluationInProgress'
import EvaluationResults from '../evaluation/phases/EvaluationResults'
import { useEffect, useState } from 'react'
import { Role } from '@prisma/client'

const STUDENTS_ATTENDANCE_PULL_INTERVAL = 1000
const STUDENTS_PROGRESS_PULL_INTERVAL = 5000

const EvaluationPage = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const [activeMenu, setActiveMenu] = useState(null)

  const {
    data: phase,
    error: errorPhase,
    mutate: mutatePhase,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/phase`,
    groupScope && evaluationId ? fetcher : null,
  )

  useEffect(() => {
    if (phase) {
      setActiveMenu(getPhaseDetails(phase.phase).menu)
    }
  }, [phase])

  const {
    data: evaluation,
    error,
    mutate,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
  )

  const {
    data: composition,
    error: errorComposition,
    mutate: mutateComposition,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/composition`,
    groupScope && evaluationId ? fetcher : null,
  )

  const {
    data: attendance,
    error: errorAttendance,
    mutate: mutateAttendance,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/attendance`,
    groupScope && evaluationId ? fetcher : null,
    { refreshInterval: STUDENTS_ATTENDANCE_PULL_INTERVAL },
  )

  const {
    data: progress,
    error: errorProgress,
    mutate: mutateProgress,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/progress`,
    groupScope && evaluationId ? fetcher : null,
    { refreshInterval: STUDENTS_PROGRESS_PULL_INTERVAL },
  )

  const {
    data: results,
    error: errorResults,
    mutate: mutateResults,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/results`,
    groupScope && evaluationId ? fetcher : null,
  )

  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading
        error={[error, errorPhase]}
        loading={
          !evaluation ||
          !phase ||
          !composition ||
          !attendance ||
          !progress ||
          !results
        }
      >
        {evaluation && (
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center" spacing={1}>
                <BackButton backUrl={`/${groupScope}/evaluations`} />
                {phase && <DisplayPhase phase={phase.phase} />}
                {evaluation.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {evaluation.label}
                  </Typography>
                )}
              </Stack>
            }
            padding={0}
          >
            <Stack spacing={1} flex={1}>
              <Stack flex={1}>
                <LayoutSplitScreen
                  rightWidth={80}
                  leftPanel={
                    <Stack spacing={1}>
                      <Stack flex={1}>
                        <EvaluationSideMenu
                          groupScope={groupScope}
                          evaluation={evaluation}
                          composition={composition}
                          attendance={attendance}
                          progress={progress}
                          results={results}
                          currentPhase={evaluation.phase}
                          active={activeMenu}
                          setActive={(menu) => setActiveMenu(menu)}
                        />
                      </Stack>
                      <Stack>
                        <EvaluationActionMenu
                          groupScope={groupScope}
                          evaluation={evaluation}
                          onPhaseChange={() => {
                            mutate()
                            mutatePhase()
                          }}
                        />
                      </Stack>
                    </Stack>
                  }
                  rightPanel={
                    <Stack spacing={1} flex={1}>
                      {activeMenu === 'settings' && (
                        <EvaluationSettings
                          groupScope={groupScope}
                          evaluation={evaluation}
                          onSettingsChanged={() => mutate()}
                        />
                      )}

                      {activeMenu === 'composition' && (
                        <EvaluationComposition
                          groupScope={groupScope}
                          evaluation={evaluation}
                          composition={composition}
                          onCompositionChanged={() => {
                            mutateComposition()
                          }}
                        />
                      )}

                      {activeMenu === 'attendance' && (
                        <EvaluationAttendance
                          groupScope={groupScope}
                          evaluation={evaluation}
                          attendance={attendance}
                          onAttendanceChanged={() => mutate()}
                        />
                      )}

                      {activeMenu === 'progress' && (
                        <EvaluationInProgress
                          groupScope={groupScope}
                          evaluation={evaluation}
                          attendance={attendance}
                          progress={progress}
                          onDurationChanged={() => mutate()}
                        />
                      )}

                      {activeMenu === 'results' && (
                        <EvaluationResults
                          groupScope={groupScope}
                          evaluation={evaluation}
                          attendance={attendance}
                          results={results}
                          onResultsChanged={() => mutateResults()}
                        />
                      )}
                    </Stack>
                  }
                />
              </Stack>
            </Stack>
          </LayoutMain>
        )}
      </Loading>
    </Authorization>
  )
}

export default EvaluationPage
