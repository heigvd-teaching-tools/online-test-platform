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
import { Role, StudentAnswerStatus } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import LayoutSplitScreen from '../../layout/LayoutSplitScreen'
import { Paper, Stack } from '@mui/material'
import Paging from '../../layout/utils/Paging'
import { useEffect, useMemo, useState } from 'react'
import StudentPhaseRedirect from './StudentPhaseRedirect'
import QuestionView from '../../question/QuestionView'
import GradingSigned from '../../evaluations/grading/GradingSigned'
import GradingPointsComment from '../../evaluations/grading/GradingPointsComment'
import LayoutMain from '../../layout/LayoutMain'
import AnswerConsult from '../../answer/AnswerConsult'
import AlertFeedback from '../../feedback/AlertFeedback'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'

const getFilledStatus = (studentAnswerStatus) => {
  switch (studentAnswerStatus) {
    case StudentAnswerStatus.MISSING:
      return 'empty'
    case StudentAnswerStatus.IN_PROGRESS:
      return 'half'
    case StudentAnswerStatus.SUBMITTED:
      return 'filled'
    default:
      return 'empty'
  }
}

const PageConsult = () => {
  const router = useRouter()
  const { evaluationId, questionPage } = router.query

  const { data: evaluationStatus, error: errorEvaluationStatus } = useSWR(
    `/api/users/evaluations/${evaluationId}/status`,
    evaluationId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  const { data: userOnEvaluation, error: errorUserOnEvaluation } = useSWR(
    `/api/users/evaluations/${evaluationId}/consult`,
    evaluationId ? fetcher : null,
    { revalidateOnFocus: false }
  )
  const [evaluationToQuestions, setEvaluationToQuestions] = useState([])
  const [selected, setSelected] = useState()

  useEffect(() => {
    if (
      userOnEvaluation &&
      userOnEvaluation.evaluationToQuestions &&
      userOnEvaluation.evaluationToQuestions.length > 0
    ) {
      setEvaluationToQuestions(userOnEvaluation.evaluationToQuestions)
      setSelected(userOnEvaluation.evaluationToQuestions[questionPage - 1])
    }
  }, [userOnEvaluation, questionPage])

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      setSelected(evaluationToQuestions[questionPage - 1])
    }
  }, [questionPage, evaluationToQuestions])

  const questionPages = useMemo(
    () =>
      evaluationToQuestions.map((jstq) => ({
        id: jstq.question.id,
        label: `Q${jstq.order + 1}`,
        fillable: true,
        tooltip: `${jstq.question.title} - ${jstq.points} points`,
        state: getFilledStatus(jstq.question.studentAnswer[0].status),
      })),
    [evaluationToQuestions]
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <Loading loading={!evaluationStatus} errors={[errorEvaluationStatus]}>
        {evaluationStatus && (
          <StudentPhaseRedirect phase={evaluationStatus.evaluation.phase}>
            <Loading
              loading={!userOnEvaluation}
              error={[errorUserOnEvaluation]}
            >
              {evaluationToQuestions && selected && (
                <LayoutMain
                  header={
                    <Stack direction="row" alignItems="center">
                      <Stack flex={1} sx={{ overflow: 'hidden' }}>
                        <Paging
                          items={questionPages}
                          active={selected.question}
                          link={(_, questionIndex) =>
                            `/users/evaluations/${evaluationId}/consult/${
                              questionIndex + 1
                            }`
                          }
                        />
                      </Stack>
                    </Stack>
                  }
                >
                  <LayoutSplitScreen
                    leftPanel={
                      selected && (
                        <QuestionView
                          order={selected.order}
                          points={selected.points}
                          question={selected.question}
                          totalPages={evaluationToQuestions.length}
                        />
                      )
                    }
                    rightWidth={65}
                    rightPanel={
                      selected && (
                        <AnswerConsult
                          id={`answer-viewer-${selected.question.id}`}
                          questionType={selected.question.type}
                          question={selected.question}
                          answer={
                            selected.question.studentAnswer[0][
                              selected.question.type
                            ]
                          }
                        />
                      )
                    }
                    footer={
                      <>
                        {' '}
                        {selected && (
                          <Paper sx={{ height: '80px' }} square>
                            <Stack
                              spacing={2}
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                              height="100%"
                              pr={1}
                            >
                              {selected.question.studentAnswer[0].studentGrading
                                .signedBy ? (
                                <>
                                  <GradingSigned
                                    signedBy={
                                      selected.question.studentAnswer[0]
                                        .studentGrading.signedBy
                                    }
                                    readOnly={true}
                                  />
                                  <GradingPointsComment
                                    points={
                                      selected.question.studentAnswer[0]
                                        .studentGrading.pointsObtained
                                    }
                                    maxPoints={selected.points}
                                    comment={
                                      selected.question.studentAnswer[0]
                                        .studentGrading.comment
                                    }
                                  />
                                </>
                              ) : (
                                <AlertFeedback severity="warning">
                                  This question has not been graded yet.
                                </AlertFeedback>
                              )}
                            </Stack>
                          </Paper>
                        )}
                      </>
                    }
                  />
                </LayoutMain>
              )}
            </Loading>
          </StudentPhaseRedirect>
        )}
      </Loading>
    </Authorisation>
  )
}

export default PageConsult
