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
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  Role,
  StudentAnswerStatus,
  UserOnEvaluationStatus,
} from '@prisma/client'
import { Box, Chip, Stack, Typography } from '@mui/material'

import { fetcher } from '@/code/utils'
import { useSnackbar } from '@/context/SnackbarContext'

import { ResizeObserverProvider } from '@/context/ResizeObserverContext'
import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'
import LayoutMain from '@/components/layout/LayoutMain'
import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import ScrollContainer from '@/components/layout/ScrollContainer'
import AnswerEditor from '@/components/answer/AnswerEditor'

import StudentPhaseRedirect from './StudentPhaseRedirect'

import QuestionView from '@/components/question/QuestionView'

import QuestionNav from './take/QuestionNav'
import StudentMainMenu from './take/StudentMainMenu'
import ContentEditor from '@/components/input/ContentEditor'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import DataGrid from '@/components/ui/DataGrid'
import { useTheme } from '@emotion/react'
import { LoadingButton } from '@mui/lab'
import AlertFeedback from '@/components/feedback/AlertFeedback'
import Overlay from '@/components/ui/Overlay'
import DialogFeedback from '@/components/feedback/DialogFeedback'

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

const PageTakeEvaluation = () => {
  const router = useRouter()

  const { showTopCenter: showSnackbar } = useSnackbar()

  const { evaluationId, pageIndex } = router.query

  const {
    data: evaluationStatus,
    error: errorEvaluationStatus,
    mutate: mutateStatus,
  } = useSWR(
    `/api/users/evaluations/${evaluationId}/status`,
    evaluationId ? fetcher : null,
    { refreshInterval: 1000 },
  )

  const getEvaluationPhase = useCallback(() => {
    return evaluationStatus?.evaluation?.phase
  }, [evaluationStatus])

  const hasStudentFinished = useCallback(() => {
    return (
      evaluationStatus?.userOnEvaluation?.status ===
      UserOnEvaluationStatus.FINISHED
    )
  }, [evaluationStatus])

  const {
    data: userOnEvaluation,
    error: errorUserOnEvaluation,
    mutate,
  } = useSWR(
    `/api/users/evaluations/${evaluationId}/take`,
    !hasStudentFinished() ? fetcher : null,
    { revalidateOnFocus: false },
  )

  const [page, setPage] = useState(parseInt(pageIndex))

  const [pages, setPages] = useState([])

  useEffect(() => {
    mutate()
  }, [evaluationStatus?.userOnEvaluation?.status, mutate])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl + S is pressed
      if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
        event.preventDefault() // Prevent the default browser save action
        showSnackbar('Your answers are saved automatically', 'success')
      }
    }

    document.addEventListener('keydown', handleKeyDown) // Attach the event listener

    return () => {
      document.removeEventListener('keydown', handleKeyDown) // Clean up the event listener
    }
  }, [showSnackbar])

  useEffect(() => {
    if (userOnEvaluation) {
      const pages = userOnEvaluation.evaluationToQuestions.map((jtq) => ({
        id: jtq.question.id,
        label: `Q${jtq.order + 1}`,
        tooltip: `${jtq.question.type} "${jtq.question.title}" - ${jtq.points} points`,
        fillable: true,
        state: getFilledStatus(jtq.question.studentAnswer[0].status),
      }))
      setPages(pages)
    }
  }, [userOnEvaluation])

  useEffect(() => {
    setPage(parseInt(pageIndex))
  }, [pageIndex])

  const evaluationToQuestion = userOnEvaluation?.evaluationToQuestions

  const activeQuestion =
    (evaluationToQuestion && evaluationToQuestion[page - 1]) || null

  const rightPenelWidth = (page, conditions) => {
    if (page !== 0) return 70
    if (page === 0 && conditions?.length > 0) {
      return 60
    } else {
      return 100
    }
  }

  const handleSubmissionToggle = useCallback((questionId, isSubmitting) => {
    /* 
      Find the question page that corresponds to the question and update its submission status
    */
    const questionPage = pages.findIndex((page) => page.id === questionId);
    if (questionPage !== -1) {
      setPages((prevPages) => {
        const newPages = [...prevPages];
        newPages[questionPage].state = isSubmitting ? 'filled' : 'half';
        return newPages;
      });
    }

    const jstq = evaluationToQuestion.find(
      (jtq) => jtq.question.id === questionId,
    );
    jstq.question.studentAnswer[0].status = isSubmitting
      ? StudentAnswerStatus.SUBMITTED
      : StudentAnswerStatus.IN_PROGRESS;
  }, [pages, evaluationToQuestion]);

  const handleOnAnswer = useCallback((questionId, updatedStudentAnswer) => {
    const jstq = evaluationToQuestion.find(
      (jtq) => jtq.question.id === questionId,
    );
    jstq.question.studentAnswer[0] = updatedStudentAnswer;
  }, [evaluationToQuestion]);

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <StudentPhaseRedirect phase={getEvaluationPhase()}>
        {hasStudentFinished() && (
          <Overlay>
            <AlertFeedback severity="info">
              <Stack spacing={1}>
                <Typography variant="h5">Evaluation Completed</Typography>
                <Typography variant="body1">
                  You have finished your evaluation. Submissions are now closed.
                </Typography>
                <Typography variant="body2">
                  If you believe this is an error or if you have any questions,
                  please reach out to your professor.
                </Typography>
              </Stack>
            </AlertFeedback>
          </Overlay>
        )}

        {!hasStudentFinished() && (
          <Loading
            loading={!userOnEvaluation || !evaluationStatus}
            errors={[errorEvaluationStatus]}
          >
            {userOnEvaluation && (
              <>
                <LayoutMain
                  header={
                    <Loading
                      loading={!userOnEvaluation}
                      errors={[errorUserOnEvaluation]}
                      message={'Loading evaluation...'}
                    >
                      <StudentMainMenu
                        evaluationId={evaluationId}
                        evaluation={evaluationStatus?.evaluation}
                        pages={pages}
                        page={page}
                      />
                    </Loading>
                  }
                >
                  <LayoutSplitScreen
                    leftPanel={
                      <LeftPanel
                        evaluationId={evaluationId}
                        page={page}
                        pages={pages}
                        conditions={userOnEvaluation.conditions}
                        activeQuestion={activeQuestion}
                      />
                    }
                    rightPanel={
                      <RightPanel
                        evaluationId={evaluationId}
                        page={page}
                        conditions={userOnEvaluation.conditions}
                        evaluationToQuestion={evaluationToQuestion}
                        setPages={setPages}
                        onAnswer={(questionId, updatedStudentAnswer) => handleOnAnswer(questionId, updatedStudentAnswer)}
                        onSubmit={(questionId) => handleSubmissionToggle(questionId, true)}
                        onUnsubmit={(questionId) => handleSubmissionToggle(questionId, false)}
                        onEndEvaluation={() => {
                          mutateStatus()
                        }}
                      />
                    }
                    rightWidth={rightPenelWidth(
                      page,
                      userOnEvaluation.conditions,
                    )}
                  />
                </LayoutMain>
              </>
            )}
          </Loading>
        )}
      </StudentPhaseRedirect>
    </Authorisation>
  )
}

const LeftPanel = ({
  evaluationId,
  page,
  pages,
  conditions,
  activeQuestion,
}) => {
  if (page === 0) {
    return (
      <Stack p={1}>
        <ContentEditor
          id={'evaluation-view-' + evaluationId}
          readOnly
          rawContent={conditions}
        />
      </Stack>
    )
  } else {
    return (
      activeQuestion && (
        <>
          <QuestionView
            order={activeQuestion?.order}
            points={activeQuestion?.points}
            question={activeQuestion?.question}
            page={page}
            totalPages={pages.length - 1}
          />
          <QuestionNav
            evaluationId={evaluationId}
            page={page}
            totalPages={pages.length}
          />
        </>
      )
    )
  }
}

const ButtonEndEvaliation = ({ evaluationId, onEndEvaluation }) => {
  const [loading, setLoading] = useState(false)

  const [endDialogOpen, setEndDialogOpen] = useState(false)

  const handleEndEvaluation = useCallback(async () => {
    setLoading(true)
    const response = await fetch(
      `/api/users/evaluations/${evaluationId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const ok = response.ok
    const data = await response.json()
    onEndEvaluation && onEndEvaluation(ok, data.message)

    setLoading(false)
  }, [evaluationId, onEndEvaluation])

  return (
    <Box>
      <LoadingButton
        variant="contained"
        color="primary"
        size="small"
        loading={loading}
        onClick={(ev) => {
          ev.stopPropagation()
          setEndDialogOpen(true)
        }}
      >
        End evaluation
      </LoadingButton>
      {endDialogOpen && (
        <DialogFeedback
          open={true}
          title={'Confirm Evaluation Completion'}
          content={
            <>
              <Typography variant="body1" gutterBottom>
                You are about to end your evaluation.
              </Typography>
              <Typography variant="body2">
                Please ensure that you have completed all necessary sections and
                reviewed your answers. Once you end the evaluation, you will not
                be able to make any further changes.
              </Typography>
              <Typography variant="body2" style={{ marginTop: '8px' }}>
                Are you ready to end your evaluation?
              </Typography>
            </>
          }
          onClose={() => setEndDialogOpen(false)}
          onConfirm={handleEndEvaluation}
        />
      )}
    </Box>
  )
}

const RightPanel = ({
  evaluationId,
  page,
  evaluationToQuestion,
  setPages,
  onSubmit,
  onAnswer,
  onUnsubmit,
  onEndEvaluation,
}) => {
  return (
    <>
      <Stack p={2} display={page === 0 ? 'flex' : 'none'}>
        <Stack
          spacing={1}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          width={'100%'}
        >
          <Typography variant="h5">
            Evaluation is composed of <b>{evaluationToQuestion.length}</b>{' '}
            questions having a total of{' '}
            <b>
              {evaluationToQuestion.reduce((acc, jtq) => acc + jtq.points, 0)}
            </b>{' '}
            pts.
          </Typography>
          <ButtonEndEvaliation
            evaluationId={evaluationId}
            onEndEvaluation={onEndEvaluation}
          />
        </Stack>
        <Stack spacing={1}>
          <QuestionsGrid
            evaluationId={evaluationId}
            evaluationToQuestion={evaluationToQuestion}
            onSubmit={onSubmit}
          />
        </Stack>
      </Stack>
      {evaluationToQuestion.map((q, index) => (
        <Box
          key={q.question.id}
          height="100%"
          display={index === page - 1 ? 'block' : 'none'}
        >
          <ResizeObserverProvider>
            <ScrollContainer>
              <AnswerEditor
                questionId={q.question.id}
                status={q.question.studentAnswer[0].status}
                onAnswer={(question, updatedStudentAnswer) => {
                  onAnswer(question.id, updatedStudentAnswer)
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index].state = getFilledStatus(
                      updatedStudentAnswer.status,
                    )
                    return newPages
                  })
                }}
                onSubmit={(question) => {
                  onSubmit(question.id)
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index].state = 'filled'
                    return newPages
                  })
                }}
                onUnsubmit={(question) => {
                  onUnsubmit(question.id)
                  /* change the state to trigger a re-render */
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index].state = 'half'
                    return newPages
                  })
                }}
              />
            </ScrollContainer>
          </ResizeObserverProvider>
        </Box>
      ))}
    </>
  )
}

const SubmitButton = ({ evaluationId, questionId, answerStatus, onSubmit }) => {
  const [submitLock, setSubmitLock] = useState(false)

  const { showTopCenter: showSnackbar } = useSnackbar()

  const [status, setStatus] = useState(answerStatus)

  useEffect(() => setStatus(answerStatus), [answerStatus])

  const onSubmitClick = useCallback(
    async (questionId) => {
      setSubmitLock(true)
      const response = await fetch(
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/submit`,
        {
          method: 'PUT',
        },
      )
      const ok = response.ok
      if (!ok) {
        setStatus(StudentAnswerStatus.IN_PROGRESS)
        showSnackbar('Cannot submit answer', 'error')
      }else{
       onSubmit && onSubmit()
      }

      setSubmitLock(false)
    },
    [onSubmit, evaluationId],
  )

  return (
    status !== StudentAnswerStatus.MISSING && (
      <LoadingButton
        key="submit"
        loading={submitLock}
        variant="contained"
        color="primary"
        size="small"
        onClick={(ev) => {
          ev.stopPropagation()
          onSubmitClick(questionId)
        }}
        disabled={status === StudentAnswerStatus.SUBMITTED}
      >
        Submit
      </LoadingButton>
    )
  )
}

const QuestionsGrid = ({ evaluationId, evaluationToQuestion, onSubmit }) => {
  const theme = useTheme()

  const statusMap = {
    [StudentAnswerStatus.SUBMITTED]: {
      color: theme.palette.success.main,
      label: 'submitted',
    },
    [StudentAnswerStatus.IN_PROGRESS]: {
      color: theme.palette.info.main,
      label: 'in progress',
    },
    [StudentAnswerStatus.MISSING]: {
      color: theme.palette.error.main,
      label: 'missing',
    },
  }

  return (
    <DataGrid
      header={{
        actions: {
          label: 'Actions',
          width: '80px',
        },

        columns: [
          {
            label: 'Question',
            column: { flexGrow: 1 },
            renderCell: (row) => {
              return (
                <Stack direction="row" alignItems="center" spacing={1} p={1}>
                  <Typography variant="body1">
                    <b>Q{row.order + 1}</b>
                  </Typography>
                  <QuestionTypeIcon
                    type={row.question.type}
                    withLabel
                    size={22}
                  />
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    spacing={1}
                    flexGrow={1}
                    overflow={'hidden'}
                  >
                    <Typography variant="body2">
                      {row.question.title}
                    </Typography>
                  </Stack>
                </Stack>
              )
            },
          },
          {
            label: 'Points',
            column: { width: '120px' },
            renderCell: (row) => (
              <Chip color="info" label={`${row.points} pts`} />
            ),
          },
          {
            label: 'Status',
            column: { width: '120px' },
            renderCell: (row) => {
              const studentAsnwerStatus = row.question.studentAnswer[0].status

              const statusColor = (status) => statusMap[status].color
              const statusLabel = (status) => statusMap[status].label
              return (
                <Typography
                  variant="body2"
                  color={statusColor(studentAsnwerStatus)}
                >
                  <b>{statusLabel(studentAsnwerStatus)}</b>
                </Typography>
              )
            },
          },
        ],
      }}
      items={evaluationToQuestion.map((jtq) => ({
        ...jtq,
        meta: {
          key: jtq.id,
          linkHref: `/users/evaluations/${evaluationId}/take/${jtq.order + 1}`,
          actions: [
            <SubmitButton
              key="submit"
              evaluationId={evaluationId}
              questionId={jtq.question.id}
              answerStatus={jtq.question.studentAnswer[0].status}
              onSubmit={() => onSubmit(jtq.question.id)}
            />,
          ],
        },
      }))}
    />
  )
}

export default PageTakeEvaluation
