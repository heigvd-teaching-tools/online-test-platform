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
import Image from 'next/image'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Stack, Typography, Tab, IconButton, Tooltip } from '@mui/material'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { Role } from '@prisma/client'

import { fetcher } from '@/code/utils'

import BackButton from '@/components/layout/BackButton'
import LayoutMain from '@/components/layout/LayoutMain'
import PiePercent from '@/components/feedback/PiePercent'
import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'

import PhaseRedirect from './PhaseRedirect'

import { getSignedSuccessRate } from '../analytics/stats'
import EvaluationAnalytics from '../analytics/EvaluationAnalytics'
import JoinClipboard from '../JoinClipboard'
import StudentResultsGrid from '../finished/StudentResultsGrid'
import ExportCSV from '../finished/ExportCSV'
import AlertFeedback from '@/components/feedback/AlertFeedback'
import ToggleStudentViewSolution from '../grading/ToggleStudentViewSolution'
import { useTheme } from '@emotion/react'

const PageFinished = () => {
  const router = useRouter()
  const { groupScope, evaluationId } = router.query

  const theme = useTheme()

  console.log(theme)

  const { data: evaluation, error: errorEvaluation } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
    groupScope && evaluationId ? fetcher : null,
  )

  const { data, error: errorQuestions } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/questions?withGradings=true`,
    groupScope && evaluationId ? fetcher : null,
    { revalidateOnFocus: false },
  )

  const [tab, setTab] = useState(1)
  const [evaluationToQuestions, setEvaluationToQuestions] = useState([])
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    if (data) {
      setEvaluationToQuestions(data)
    }
  }, [data])

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      setParticipants(
        evaluationToQuestions[0].question.studentAnswer
          .map((sa) => sa.user)
          .sort((a, b) => a.name.localeCompare(b.name)),
      )
    }
  }, [evaluationToQuestions])

  const handleTabChange = (_, newValue) => {
    setTab(newValue)
  }

  const areAllGradingSigned = () => {
    return evaluationToQuestions.every((eq) =>
      eq.question.studentAnswer.every((sa) => sa.studentGrading.signedBy),
    )
  }

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <PhaseRedirect phase={evaluation?.phase}>
        <Loading
          errors={[errorEvaluation, errorQuestions]}
          loading={!evaluation || !evaluationToQuestions}
        >
          <TabContext value={tab}>
            {evaluationToQuestions && evaluationToQuestions.length > 0 && (
              <LayoutMain
                hideLogo
                header={
                  <Stack direction="row" alignItems="center">
                    <BackButton backUrl={`/${groupScope}/evaluations`} />
                    {evaluation?.id && (
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                      >
                        {evaluation.label}
                      </Typography>
                    )}
                  </Stack>
                }
                subheader={
                  <TabList onChange={handleTabChange}>
                    <Tab label="Results" value={1} />
                    <Tab label="Analytics" value={2} />
                  </TabList>
                }
                padding={2}
                spacing={2}
              >
                <TabPanel value={1}>
                  <Stack spacing={4}>
                    <JoinClipboard evaluationId={evaluationId} />

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6">
                          Overall success rate
                        </Typography>
                        <PiePercent
                          value={getSignedSuccessRate(evaluationToQuestions)}
                        />
                        {!areAllGradingSigned() && (
                          <AlertFeedback severity="warning">
                            Some gradings are not signed yet.
                          </AlertFeedback>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <ToggleStudentViewSolution
                          groupScope={groupScope}
                          evaluation={evaluation}
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">
                            Export 
                          </Typography>
                          <ExportCSV
                            evaluation={evaluation}
                            evaluationToQuestions={evaluationToQuestions}
                            participants={participants}
                          />
                           <IconButton
                              color={'info'}
                              onClick={() => {
                                // open in new page
                                window.open(`/api/${groupScope}/evaluations/${evaluationId}/export`, '_blank')
                              }}
                            >
                              <Image
                                  alt="Export"
                                  src="/svg/icons/file-pdf.svg"
                                  width="22"
                                  height="22"
                                />
                            </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>

                    <StudentResultsGrid
                      evaluationToQuestions={evaluationToQuestions}
                      actions={(row) => {
                        return (
                          <Tooltip
                            title="View student's answers"
                            key="view-student-answers"
                          >
                            <a
                              href={`/${groupScope}/evaluations/${evaluationId}/consult/${row.participant.email}/1`}
                              target="_blank"
                            >
                              <IconButton size="small">
                                <Image
                                  alt="View"
                                  src="/svg/icons/view-user.svg"
                                  width="18"
                                  height="18"
                                />
                              </IconButton>
                            </a>
                          </Tooltip>
                        )
                      }}
                      questionCellClick={async (questionId, participantId) => {
                        const questionOrder =
                          evaluationToQuestions.findIndex(
                            (jstq) => jstq.question.id === questionId,
                          ) + 1
                        const participantEmail = participants.find(
                          (p) => p.id === participantId,
                        ).email
                        await router.push(
                          `/${groupScope}/evaluations/${evaluationId}/consult/${participantEmail}/${questionOrder}`,
                        )
                      }}
                    />
                  </Stack>
                </TabPanel>
                <TabPanel value={2}>
                  <EvaluationAnalytics
                    showSuccessRate
                    evaluationToQuestions={evaluationToQuestions}
                  />
                </TabPanel>
              </LayoutMain>
            )}
          </TabContext>
        </Loading>
      </PhaseRedirect>
    </Authorisation>
  )
}

export default PageFinished
