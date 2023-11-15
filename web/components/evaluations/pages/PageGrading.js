import { useCallback, useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  StudentQuestionGradingStatus,
  EvaluationPhase,
  Role,
} from '@prisma/client'

import {
  Stack,
  Divider,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { LoadingButton } from '@mui/lab'
import { useSession } from 'next-auth/react'
import { useDebouncedCallback } from 'use-debounce'

import DialogFeedback from '@/components/feedback/DialogFeedback'
import PiePercent from '@/components/feedback/PiePercent'
import { fetcher } from '@/code/utils'

import LayoutMain from '@/components/layout/LayoutMain'
import BackButton from '@/components/layout/BackButton'
import Loading from '@/components/feedback/Loading'

import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import Paging from '@/components/layout/utils/Paging'
import MainMenu from '@/components/layout/MainMenu'
import Authorisation from '@/components/security/Authorisation'

import QuestionView from '@/components/question/QuestionView'
import AnswerCompare from '@/components/answer/AnswerCompare'

import { useSnackbar } from '@/context/SnackbarContext'


import { update } from './crud'

import PhaseRedirect from './PhaseRedirect'
import { getGradingStats, getSignedSuccessRate } from '../analytics/stats'


import GradingSignOff from '../grading/GradingSignOff'
import ParticipantNav from '../grading/ParticipantNav'

const PageGrading = () => {
  const router = useRouter()
  const { groupScope, evaluationId, participantId, activeQuestion } = router.query

  const { data: session } = useSession()
  const { show: showSnackbar } = useSnackbar()

  const { data: evaluation, error: errorEvaluation } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}`,
      groupScope && evaluationId ? fetcher : null
  )

  const {
    data,
    mutate,
    error: errorQuestions,
  } = useSWR(
    `/api/${groupScope}/evaluations/${evaluationId}/questions?withGradings=true`,
      groupScope && evaluationId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [evaluationToQuestions, setEvaluationToQuestions] = useState([])
  const [participants, setParticipants] = useState([])

  const [filter, setFilter] = useState()
  const [evaluationToQuestion, setEvaluationEvaluationToQuestion] = useState()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const [autoGradeSignOffDialogOpen, setAutoGradeSignOffDialogOpen] =
    useState(false)
  const [endGradingDialogOpen, setEndGradingDialogOpen] = useState(false)
  const [someUnsignedDialogOpen, setSomeUnsignedDialogOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setEvaluationToQuestions(data)
    }
  }, [data])

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      let jstq = evaluationToQuestions[activeQuestion - 1]
      if (!jstq) {
        // goto first question and first participant
        router.push(
          `/${groupScope}/evaluations/${evaluationId}/grading/1?participantId=${evaluationToQuestions[0].question.studentAnswer[0].user.id}`
        )
        return
      }
      if (jstq.question.studentAnswer.length === 0) {
        // no participants
        return
      }
      setEvaluationEvaluationToQuestion(jstq)
      setParticipants(
        jstq.question.studentAnswer
          .map((sg) => sg.user)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      // goto first participant
      if (participantId === undefined) {
        router.push(
          `/${groupScope}/evaluations/${evaluationId}/grading/${activeQuestion}?participantId=${jstq.question.studentAnswer[0].user.id}`
        )
      }
    }
  }, [
    activeQuestion,
    evaluationId,
    participantId,
    evaluationToQuestions,
    router,
    groupScope
  ])

  const saveGrading = useCallback(async (grading) => {
    setLoading(true)
    let newGrading = await fetch(`/api/${groupScope}/gradings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grading,
      }),
    }).then((res) => res.json())
    setLoading(false)
    return newGrading
  }, [groupScope])

  const debouncedSaveGrading = useDebouncedCallback(saveGrading, 500)

  const onChangeGrading = useCallback(
    async (grading) => {
      const newEvaluationToQuestions = [...evaluationToQuestions]
      let newGrading = grading
      evaluationToQuestion.question.studentAnswer =
        evaluationToQuestion.question.studentAnswer.map((sa) => {
          if (sa.user.email === grading.userEmail) {
            return {
              ...sa,
              studentGrading: {
                ...sa.studentGrading,
                ...grading,
              },
            }
          }
          return sa
        })
      debouncedSaveGrading(newGrading)
      setEvaluationToQuestions(newEvaluationToQuestions)
      await mutate(newEvaluationToQuestions, false)
    },
    [evaluationToQuestions, evaluationToQuestion, mutate]
  )

  const signOffAllAutograded = useCallback(async () => {
    let updated = []
    const newEvaluationToQuestions = [...evaluationToQuestions]
    for (const jstq of newEvaluationToQuestions) {
      for (const { studentGrading } of jstq.question.studentAnswer) {
        if (
          !studentGrading.signedBy &&
          studentGrading.status === StudentQuestionGradingStatus.AUTOGRADED
        ) {
          studentGrading.signedBy = session.user
          updated.push(studentGrading)
        }
      }
    }
    await Promise.all(updated.map((grading) => saveGrading(grading)))
    setEvaluationToQuestions(newEvaluationToQuestions)
    await mutate(newEvaluationToQuestions, false)
  }, [evaluationToQuestions, mutate, session])

  const endGrading = useCallback(async () => {
    setSaving(true)
    await update(groupScope, evaluationId, {
      phase: EvaluationPhase.FINISHED,
    })
      .then(() => {
        router.push(`/${groupScope}/evaluations/${evaluationId}/finished`)
      })
      .catch(() => {
        showSnackbar('Error', 'error')
      })
    setSaving(false)
  }, [groupScope, evaluationId, router, showSnackbar])

  const nextParticipantOrQuestion = useCallback(async () => {
    let nextParticipantIndex =
      participants.findIndex((p) => p.id === participantId) + 1
    if (nextParticipantIndex < participants.length) {
      await router.push(
        `/${groupScope}/evaluations/${evaluationId}/grading/${activeQuestion}?participantId=${participants[nextParticipantIndex].id}`
      )
    } else {
      if (activeQuestion < evaluationToQuestions.length) {
        await router.push(
          `/${groupScope}/evaluations/${evaluationId}/grading/${
            parseInt(activeQuestion) + 1
          }?participantId=${participants[0].id}`
        )
      } else {
        // count signed gradings vs total gradings
        let stats = getGradingStats(evaluationToQuestions)
        if (stats.totalSigned === stats.totalGradings) {
          setEndGradingDialogOpen(true)
        } else {
          setSomeUnsignedDialogOpen(true)
        }
      }
    }
  }, [
    activeQuestion,
    participantId,
    evaluationId,
    participants,
    router,
    evaluationToQuestions,
    groupScope
  ])

  const prevParticipantOrQuestion = useCallback(() => {
    let prevParticipantIndex =
      participants.findIndex((p) => p.id === participantId) - 1
    if (prevParticipantIndex >= 0) {
      router.push(
        `/${groupScope}/evaluations/${evaluationId}/grading/${activeQuestion}?participantId=${participants[prevParticipantIndex].id}`
      )
    } else {
      if (activeQuestion - 1 >= 1) {
        router.push(
          `/${groupScope}/evaluations/${evaluationId}/grading/${
            activeQuestion - 1
          }?participantId=${participants[participants.length - 1].id}`
        )
      }
    }
  }, [groupScope, activeQuestion, evaluationId, participantId, participants, router])

  const allGradingsSigned = useCallback((questionId) => {
    const jstq = evaluationToQuestions.find(
      (jstq) => jstq.question.id === questionId
    )
    return (
      jstq &&
      jstq.question.studentAnswer.every(
        (sa) => sa.studentGrading.signedBy
      )
    )
  }, [evaluationToQuestions])

  const questionPages = useMemo(() => {
    return evaluationToQuestions.map(
      (jstq) => jstq.question
    ).map((q) => ({
      id: q.id,
      tooltip: q.title,
      isFilled: allGradingsSigned(q.id),
    }));
  }, [evaluationToQuestions, allGradingsSigned])

  const ready =
    evaluationToQuestions &&
    evaluationToQuestion &&
    participants &&
    participantId

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <PhaseRedirect phase={evaluation?.phase}>
        <Loading
          errors={[errorEvaluation, errorQuestions]}
          loading={!evaluation || !data}
        >
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/evaluations`} />
                { evaluation?.id && (
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {evaluation.label}
                  </Typography>
                )}
              </Stack>
            }
            subheader={
              <Stack direction="row" alignItems="center">
                <Stack flex={1} sx={{ overflow: 'hidden' }}>
                  {ready && (
                    <Paging
                      items={questionPages}
                      active={evaluationToQuestion.question}
                      link={(_, index) =>
                        `/${groupScope}/evaluations/${evaluationId}/grading/${
                          index + 1
                        }?participantId=${participantId}`
                      }
                    />
                  )}
                </Stack>
              </Stack>
            }
            padding={0}
            spacing={2}
          >
            <LayoutSplitScreen
              header={<MainMenu />}
              leftPanel={
                <Stack
                  direction="row"
                  sx={{ position: 'relative', height: '100%' }}
                >
                  {evaluationToQuestion && (
                    <QuestionView
                      order={evaluationToQuestion.order}
                      points={evaluationToQuestion.points}
                      question={evaluationToQuestion.question}
                      totalPages={evaluationToQuestions.length}
                    />
                  )}
                </Stack>
              }
              rightWidth={75}
              rightPanel={
                <Stack
                  direction="row"
                  padding={1}
                  position="relative"
                  height="100%"
                >
                  {ready && (
                    <>
                      <ParticipantNav
                        participants={participants}
                        active={participants.find(
                          (participant) => participant.id === participantId
                        )}
                        onParticipantClick={(participant) => {
                          router.push(
                            `/${groupScope}/evaluations/${evaluationId}/grading/${activeQuestion}?participantId=${participant.id}`
                          )
                        }}
                        isParticipantFilled={(participant) => {
                          const grading =
                            evaluationToQuestion &&
                            evaluationToQuestion.question.studentAnswer.find(
                              (sa) => sa.user.id === participant.id
                            ).studentGrading
                          return grading && grading.signedBy
                        }}
                      />
                      <Divider orientation="vertical" light flexItem />
                      <AnswerCompare
                        questionType={evaluationToQuestion.question.type}
                        solution={
                          evaluationToQuestion.question[
                            evaluationToQuestion.question.type
                          ]
                        }
                        answer={
                          evaluationToQuestion.question.studentAnswer.find(
                            (answer) => answer.user.id === participantId
                          )[evaluationToQuestion.question.type]
                        }
                      />
                    </>
                  )}
                </Stack>
              }
              footer={
                ready && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    height="100px"
                  >
                    <GradingNextBack
                      isFirst={
                        participants.findIndex(
                          (p) => p.id === participantId
                        ) === 0 && parseInt(activeQuestion) === 0
                      }
                      onPrev={prevParticipantOrQuestion}
                      onNext={nextParticipantOrQuestion}
                    />
                    <GradingSignOff
                      loading={loading}
                      grading={
                        evaluationToQuestion.question.studentAnswer.find(
                          (ans) => ans.user.id === participantId
                        ).studentGrading
                      }
                      maxPoints={evaluationToQuestion.points}
                      onChange={onChangeGrading}
                    />
                    <SuccessRate
                      value={getSignedSuccessRate(evaluationToQuestions)}
                    />
                    <GradingActions
                      stats={getGradingStats(evaluationToQuestions)}
                      loading={loading || saving}
                      signOffAllAutograded={() =>
                        setAutoGradeSignOffDialogOpen(true)
                      }
                      endGrading={() => setEndGradingDialogOpen(true)}
                    />
                  </Stack>
                )
              }
            />
          </LayoutMain>
          <DialogFeedback
            open={autoGradeSignOffDialogOpen}
            onClose={() => setAutoGradeSignOffDialogOpen(false)}
            title="Sign off all autograded"
            content={
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Its is recommended to control the autograded answers before
                  signing them off.
                </Typography>
                <Typography variant="button" gutterBottom>
                  Are you sure you want to sign off all autograded answers?
                </Typography>
              </>
            }
            onConfirm={signOffAllAutograded}
          />
          <DialogFeedback
            open={endGradingDialogOpen}
            onClose={() => setEndGradingDialogOpen(false)}
            title="End grading"
            content={
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You wont be able to get back to the grading phase.
                </Typography>
                <Typography variant="button" gutterBottom>
                  Are you sure you want to end grading?
                </Typography>
              </>
            }
            onConfirm={endGrading}
          />
          <DialogFeedback
            open={someUnsignedDialogOpen}
            onClose={() => setSomeUnsignedDialogOpen(false)}
            title="End grading"
            content={
              <Typography variant="body1" sx={{ mb: 2 }}>
                The signoff process is not complete.
              </Typography>
            }
          />
        </Loading>
      </PhaseRedirect>
    </Authorisation>
  )
}
const GradingNextBack = ({ isFirst, onPrev, onNext }) => {
  return (
    <Paper>
      <Stack direction="row" justifyContent="space-between">
        <IconButton
          onClick={onPrev}
          disabled={isFirst}
          sx={{ width: 90, height: 90, borderRadius: 0, borderRight: 0 }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <IconButton
          onClick={onNext}
          sx={{ width: 90, height: 90, borderRadius: 0, borderRight: 0 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Stack>
    </Paper>
  )
}

const SuccessRate = ({ value }) => {
  return (
    <Tooltip
      title={<>
        <Box>Displays the overall success rate based on all <b>signed</b> gradings up to this point.</Box>
        <Box>(total of all awarded points / total of all possible points) * 100</Box>
      </>}
    >
    <Paper sx={{ p: 1 }}>
      <Stack alignItems="center" justifyContent="center" spacing={1}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Success Rate
        </Typography>
        <PiePercent value={value} />
      </Stack>
    </Paper>
    </Tooltip>
  )
}

const GradingActions = ({
  stats: { totalSigned, totalGradings, totalAutogradedUnsigned },
  loading,
  signOffAllAutograded,
  endGrading,
}) => (
  <Tooltip
    title={
      totalSigned === totalGradings
        ? 'All gradings signed'
        : `You have ${totalGradings - totalSigned} gradings to sign off`
    }
  >
  <Paper sx={{ p: 1 }}>
    <Stack justifyContent="center" spacing={1} sx={{ height: '100%' }}>
      <Stack
        flexGrow={1}
        alignItems="start"
        justifyContent="space-between"
        direction="row"
      >
        <Stack direction="row" alignItems="center" sx={{ mr: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Grading progress:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {totalSigned} / {totalGradings}
          </Typography>
        </Stack>
        {totalSigned < totalGradings && (
          <PiePercent
            size={39}
            value={Math.round((totalSigned / totalGradings) * 100)}
          />
        )}
      </Stack>
      {totalSigned === totalGradings && (
        <Button
          color="success"
          fullWidth
          variant="contained"
          size="small"
          onClick={endGrading}
        >
          End grading
        </Button>
      )}
      {totalAutogradedUnsigned > 0 && (
        <LoadingButton
          loading={loading}
          size="small"
          onClick={signOffAllAutograded}
        >
          Sign off {totalAutogradedUnsigned} autograded unsigned
        </LoadingButton>
      )}
    </Stack>
  </Paper>
  </Tooltip>
)

export default PageGrading
