import { useCallback, useEffect, useState, useRef } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  StudentQuestionGradingStatus,
  JamSessionPhase,
  Role,
} from '@prisma/client'
import Image from 'next/image'

import {
  Stack,
  Divider,
  Paper,
  Button,
  Menu,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DialogFeedback from '../../feedback/DialogFeedback'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

import PiePercent from '../../feedback/PiePercent'
import PhaseRedirect from './PhaseRedirect'

import LayoutMain from '../../layout/LayoutMain'
import Loading from '../../feedback/Loading'

import LayoutSplitScreen from '../../layout/LayoutSplitScreen'
import QuestionPages from '../take/QuestionPages'
import MainMenu from '../../layout/MainMenu'
import QuestionView from '../../question/QuestionView'
import AnswerCompare from '../../answer/AnswerCompare'
import GradingSignOff from '../grading/GradingSignOff'
import ParticipantNav from '../grading/ParticipantNav'
import { useSession } from 'next-auth/react'
import { useSnackbar } from '../../../context/SnackbarContext'

import Authorisation from '../../security/Authorisation'
import { update } from './crud'
import { getGradingStats, getSignedSuccessRate } from './stats'
import { fetcher } from '../../../code/utils'

const PageGrading = () => {
  const router = useRouter()
  const { jamSessionId, participantId, activeQuestion } = router.query

  const { data: session } = useSession()
  const { show: showSnackbar } = useSnackbar()

  const { data: jamSession, error: errorJamSession } = useSWR(
    `/api/jam-sessions/${jamSessionId}`,
    jamSessionId ? fetcher : null
  )

  const {
    data,
    mutate,
    error: errorQuestions,
  } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions?withGradings=true`,
    jamSessionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [jamSessionToQuestions, setJamSessionToQuestions] = useState([])
  const [participants, setParticipants] = useState([])

  const [filter, setFilter] = useState()
  const [jamSessionToQuestion, setJamSessionJamSessionToQuestion] = useState()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const [autoGradeSignOffDialogOpen, setAutoGradeSignOffDialogOpen] =
    useState(false)
  const [endGradingDialogOpen, setEndGradingDialogOpen] = useState(false)
  const [someUnsignedDialogOpen, setSomeUnsignedDialogOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setJamSessionToQuestions(data)
    }
  }, [data])

  const applyFilter = useCallback(
    (jamSessionToQuestions) => {
      switch (filter) {
        case 'unsigned':
          let questionToDisplay = jamSessionToQuestions.filter((jstq) =>
            jstq.question.studentAnswer.some(
              (sg) => !sg.studentGrading.signedBy
            )
          )
          const indexToDisplay = questionToDisplay.findIndex(
            (q) => q.id === jamSessionToQuestion?.question.id
          )
          if (questionToDisplay.length > 0 && indexToDisplay === -1) {
            // active questions is not in the filtered list -> jump to first
            router.push(
              `/jam-sessions/${jamSessionId}/grading/1?participantId=${questionToDisplay[0].studentGrading[0].user.id}`
            )
          }
          return questionToDisplay
        default:
          return jamSessionToQuestions
      }
    },
    [jamSessionId, filter, jamSessionToQuestion, router]
  )

  useEffect(() => {
    if (jamSessionToQuestions && jamSessionToQuestions.length > 0) {
      let jstq = applyFilter(jamSessionToQuestions)[activeQuestion - 1]
      if (!jstq) {
        // goto first question and first participant
        router.push(
          `/jam-sessions/${jamSessionId}/grading/1?participantId=${jamSessionToQuestions[0].question.studentAnswer[0].user.id}`
        )
        return
      }
      if (jstq.question.studentAnswer.length === 0) {
        // no participants
        return
      }
      setJamSessionJamSessionToQuestion(jstq)
      setParticipants(
        jstq.question.studentAnswer
          .map((sg) => sg.user)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      // goto first participant
      if (participantId === undefined) {
        router.push(
          `/jam-sessions/${jamSessionId}/grading/${activeQuestion}?participantId=${jstq.question.studentAnswer[0].user.id}`
        )
      }
    }
  }, [
    activeQuestion,
    jamSessionId,
    participantId,
    jamSessionToQuestions,
    router,
    applyFilter,
  ])

  const saveGrading = async (grading) => {
    setLoading(true)
    let newGrading = await fetch(`/api/gradings`, {
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
  }

  const onSignOff = useCallback(
    async (grading) => {
      const newJamSessionToQuestions = [...jamSessionToQuestions]
      let newGrading = grading
      jamSessionToQuestion.question.studentAnswer =
        jamSessionToQuestion.question.studentAnswer.map((sa) => {
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
      await saveGrading(newGrading)
      setJamSessionToQuestions(newJamSessionToQuestions)
      await mutate(newJamSessionToQuestions, false)
    },
    [jamSessionToQuestions, jamSessionToQuestion, mutate]
  )

  const signOffAllAutograded = useCallback(async () => {
    let updated = []
    const newJamSessionToQuestions = [...jamSessionToQuestions]
    for (const jstq of newJamSessionToQuestions) {
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
    setJamSessionToQuestions(newJamSessionToQuestions)
    await mutate(newJamSessionToQuestions, false)
  }, [jamSessionToQuestions, mutate, session])

  const endGrading = useCallback(async () => {
    setSaving(true)
    await update(jamSessionId, {
      phase: JamSessionPhase.FINISHED,
    })
      .then(() => {
        router.push(`/jam-sessions/${jamSessionId}/finished`)
      })
      .catch(() => {
        showSnackbar('Error', 'error')
      })
    setSaving(false)
  }, [jamSessionId, router, showSnackbar])

  const nextParticipantOrQuestion = useCallback(async () => {
    let nextParticipantIndex =
      participants.findIndex((p) => p.id === participantId) + 1
    if (nextParticipantIndex < participants.length) {
      await router.push(
        `/jam-sessions/${jamSessionId}/grading/${activeQuestion}?participantId=${participants[nextParticipantIndex].id}`
      )
    } else {
      if (activeQuestion < jamSessionToQuestions.length) {
        await router.push(
          `/jam-sessions/${jamSessionId}/grading/${
            parseInt(activeQuestion) + 1
          }?participantId=${participants[0].id}`
        )
      } else {
        // count signed gradings vs total gradings
        let stats = getGradingStats(jamSessionToQuestions)
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
    jamSessionId,
    participants,
    router,
    jamSessionToQuestions,
  ])

  const prevParticipantOrQuestion = useCallback(() => {
    let prevParticipantIndex =
      participants.findIndex((p) => p.id === participantId) - 1
    if (prevParticipantIndex >= 0) {
      router.push(
        `/jam-sessions/${jamSessionId}/grading/${activeQuestion}?participantId=${participants[prevParticipantIndex].id}`
      )
    } else {
      if (activeQuestion - 1 >= 1) {
        router.push(
          `/jam-sessions/${jamSessionId}/grading/${
            activeQuestion - 1
          }?participantId=${participants[participants.length - 1].id}`
        )
      }
    }
  }, [activeQuestion, jamSessionId, participantId, participants, router])

  const ready =
    jamSessionToQuestions &&
    jamSessionToQuestion &&
    participants &&
    participantId

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <PhaseRedirect phase={jamSession?.phase}>
        <Loading
          errors={[errorJamSession, errorQuestions]}
          loading={!jamSession || !data}
        >
          <LayoutMain
            header={<MainMenu />}
            subheader={
              <Stack direction="row" alignItems="center">
                <Stack flex={1} sx={{ overflow: 'hidden' }}>
                  {ready && (
                    <QuestionPages
                      questions={applyFilter(jamSessionToQuestions).map(
                        (jstq) => jstq.question
                      )}
                      activeQuestion={jamSessionToQuestion.question}
                      link={(questionId, index) =>
                        `/jam-sessions/${jamSessionId}/grading/${
                          index + 1
                        }?participantId=${participantId}`
                      }
                      isFilled={(questionId) => {
                        const jstq = jamSessionToQuestions.find(
                          (jstq) => jstq.question.id === questionId
                        )
                        return (
                          jstq &&
                          jstq.question.studentAnswer.every(
                            (sa) => sa.studentGrading.signedBy
                          )
                        )
                      }}
                    />
                  )}
                </Stack>
                <GradingQuestionFilter
                  onFilter={(filter) => {
                    setFilter(filter)
                  }}
                />
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
                  {jamSessionToQuestion && (
                    <QuestionView
                      order={jamSessionToQuestion.order}
                      points={jamSessionToQuestion.points}
                      question={jamSessionToQuestion.question}
                      totalPages={jamSessionToQuestions.length}
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
                  overflowX="auto"
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
                            `/jam-sessions/${jamSessionId}/grading/${activeQuestion}?participantId=${participant.id}`
                          )
                        }}
                        isParticipantFilled={(participant) => {
                          const grading =
                            jamSessionToQuestion &&
                            jamSessionToQuestion.question.studentAnswer.find(
                              (sa) => sa.user.id === participant.id
                            ).studentGrading
                          return grading && grading.signedBy
                        }}
                      />
                      <Divider orientation="vertical" light flexItem />
                      <AnswerCompare
                        questionType={jamSessionToQuestion.question.type}
                        solution={
                          jamSessionToQuestion.question[
                            jamSessionToQuestion.question.type
                          ]
                        }
                        answer={
                          jamSessionToQuestion.question.studentAnswer.find(
                            (answer) => answer.user.id === participantId
                          )[jamSessionToQuestion.question.type]
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
                        jamSessionToQuestion.question.studentAnswer.find(
                          (ans) => ans.user.id === participantId
                        ).studentGrading
                      }
                      maxPoints={jamSessionToQuestion.points}
                      onSignOff={onSignOff}
                      clickNextParticipant={(current) => {
                        const next =
                          participants.findIndex(
                            (studentGrading) => studentGrading.id === current.id
                          ) + 1
                        if (next < participants.length) {
                          router.push(
                            `/jam-sessions/${jamSessionId}/grading/${activeQuestion}?participantId=${participants[next].id}`
                          )
                        }
                      }}
                    />
                    <SuccessRate
                      value={getSignedSuccessRate(jamSessionToQuestions)}
                    />
                    <GradingActions
                      stats={getGradingStats(jamSessionToQuestions)}
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
    <Paper sx={{ p: 1 }}>
      <Stack alignItems="center" justifyContent="center" spacing={1}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Success Rate
        </Typography>
        <PiePercent value={value} />
      </Stack>
    </Paper>
  )
}

const GradingActions = ({
  stats: { totalSigned, totalGradings, totalAutogradedUnsigned },
  loading,
  signOffAllAutograded,
  endGrading,
}) => (
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
)

const GradingQuestionFilter = ({ onFilter }) => {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const [filter, setFilter] = useState(undefined)

  useEffect(() => {
    onFilter(filter)
  }, [onFilter, filter])

  return (
    <Stack direction="row" sx={{ ml: 2 }}>
      <Button
        ref={buttonRef}
        color="info"
        startIcon={
          <Image
            src="/svg/grading/filter-inactive.svg"
            alt="Filter inactive"
            layout="fixed"
            width={18}
            height={18}
          />
        }
        endIcon={<ExpandMoreIcon />}
        onClick={() => setOpen(!open)}
      >
        {filter ? filter : 'none'}
      </Button>
      <Menu
        anchorEl={buttonRef.current}
        open={open}
        keepMounted
        onClose={() => setOpen(false)}
      >
        <MenuList onClick={() => setOpen(false)}>
          <MenuItem onClick={() => setFilter(undefined)}>None</MenuItem>
          <MenuItem onClick={() => setFilter('unsigned')}>Unsigned</MenuItem>
        </MenuList>
      </Menu>
    </Stack>
  )
}

export default PageGrading
