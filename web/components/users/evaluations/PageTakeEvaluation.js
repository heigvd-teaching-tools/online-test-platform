import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Role, StudentAnswerStatus } from "@prisma/client"
import { Box,  Chip, Stack, Typography} from "@mui/material"

import { fetcher } from "@/code/utils"
import { useSnackbar } from "@/context/SnackbarContext"

import { ResizeObserverProvider } from "@/context/ResizeObserverContext"
import Authorisation from "@/components/security/Authorisation"
import Loading from "@/components/feedback/Loading"
import LayoutMain from "@/components/layout/LayoutMain"
import LayoutSplitScreen from "@/components/layout/LayoutSplitScreen"
import ScrollContainer from "@/components/layout/ScrollContainer"
import AnswerEditor from "@/components/answer/AnswerEditor"

import StudentPhaseRedirect from "./StudentPhaseRedirect"

import QuestionView from "@/components/question/QuestionView"

import QuestionNav from "./take/QuestionNav"
import StudentMainMenu from "./take/StudentMainMenu"
import ContentEditor from "@/components/input/ContentEditor"
import QuestionTypeIcon from "@/components/question/QuestionTypeIcon"
import DataGrid from "@/components/ui/DataGrid"
import { useTheme } from "@emotion/react"
import { LoadingButton } from "@mui/lab"

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

  const { data: session } = useSession()

  const { data: evaluationPhase, error: errorEvaluationPhase } = useSWR(
    `/api/users/evaluations/${evaluationId}/phase`,
    evaluationId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  const { data: userOnEvaluation, error: errorUserOnEvaluation, mutate } = useSWR(
    `/api/users/evaluations/${evaluationId}/take`,
    session && evaluationId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [page, setPage] = useState(parseInt(pageIndex))

  const [ pages, setPages ] = useState([])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl or Cmd key is pressed along with 'S'
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
        state: getFilledStatus(jtq.question.studentAnswer[0].status)
      }))
      setPages(pages)
    }
  }, [userOnEvaluation])

  useEffect(() => {
    setPage(parseInt(pageIndex))
  }, [pageIndex])

  const evaluationToQuestion = userOnEvaluation?.evaluationToQuestions;

  const activeQuestion = evaluationToQuestion && evaluationToQuestion[page -1] || null;

  const rightPenelWidth = (page, conditions) => {
    if(page !== 0) return 70;
    if(page === 0 && conditions?.length > 0) {
      return 60
    } else {
      return 100
    }
  }

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      <Loading loading={!evaluationPhase} errors={[errorEvaluationPhase]}>
        {evaluationPhase && (
          <StudentPhaseRedirect phase={evaluationPhase.phase}>

            { userOnEvaluation && (
              <>
                <LayoutMain
                    header={
                      <Loading
                        loading={!userOnEvaluation}
                        errors={[errorUserOnEvaluation]}
                        message={"Loading evaluation..."}
                      >
                        <StudentMainMenu
                          evaluationId={evaluationId}
                          evaluationPhase={evaluationPhase}
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
                        onSubmit={(questionId) => {
                          const questionPage = pages.findIndex((page) => page.id === questionId)
                          console.log("onSubmit", questionId, questionPage);
                          if (questionPage !== -1) {
                            setPages((prevPages) => {
                              const newPages = [...prevPages]
                              newPages[questionPage].state = 'filled'
                              return newPages
                            })
                          }
                          mutate()
                        }}
                      />
                    }
                    rightWidth={rightPenelWidth(page, userOnEvaluation.conditions)}
                  />

                </LayoutMain>
               </>
            )}

          </StudentPhaseRedirect>
        )}
      </Loading>


    </Authorisation>
  )
}

const LeftPanel = ({ evaluationId, page, pages, conditions, activeQuestion }) => {
  if (page === 0) {
    return (
      <Stack p={1}>
        <ContentEditor
          id={'evaluation-view-' + evaluationId}
          readOnly
          rawContent={conditions}
        />
      </Stack>
    );
  } else {
    return (
      activeQuestion && <>
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
            totalPages={pages.length - 1}
          />
        </>
    );
  }
};



const RightPanel = ({ evaluationId, page, evaluationToQuestion, setPages, onSubmit }) => {
   
  if(page === 0) {
    return (
      <Stack p={2}>

        <Typography variant="h5">Evaluation is composed of <b>{evaluationToQuestion.length}</b> questions having a total of <b>{evaluationToQuestion.reduce((acc, jtq) => acc + jtq.points, 0)}</b> pts.</Typography>

        <Stack spacing={1}>
            <QuestionsGrid
              evaluationId={evaluationId}
              evaluationToQuestion={evaluationToQuestion}
              onSubmit={onSubmit}
            />
        </Stack>
      </Stack>
    );
  } else {
    return (
      evaluationToQuestion.map((q, index) => (
        <Box
          key={q.question.id}
          height="100%"
          display={index === page - 1 ? 'block' : 'none'}
        >
          <ResizeObserverProvider>
            <ScrollContainer>
              <AnswerEditor
                question={q.question}
                onAnswer={(question, updatedStudentAnswer) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = updatedStudentAnswer.status                  
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index].state = getFilledStatus(updatedStudentAnswer.status)
                    return newPages
                  })
                }}
                onSubmit={(question) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = StudentAnswerStatus.SUBMITTED
                  /* change the state to trigger a re-render */
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index].state = 'filled'
                    return newPages
                  })
                }}
                onUnsubmit={(question) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = StudentAnswerStatus.IN_PROGRESS
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
      ))
    )
  }
}

const SubmitButton = ({ evaluationId, questionId, answerStatus, onSubmit }) => {
  const [submitLock, setSubmitLock] = useState(false)

  const onSubmitClick = useCallback(async (questionId) => {
    setSubmitLock(true)
    await fetch(`/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/submit`, {
      method: 'PUT',
    })
    .finally(async () => {
      onSubmit && onSubmit()
    })
    setSubmitLock(false)
  }, [onSubmit])

  return (
    answerStatus !== StudentAnswerStatus.MISSING &&
        <LoadingButton
          key="submit"
          loading={submitLock}
          variant="contained"
          color="primary"
          size="small"
          onClick={(ev) => {
            ev.stopPropagation();
            console.log("onSubmitClick", questionId);
            onSubmitClick(questionId);
            
          }}
          disabled={answerStatus === StudentAnswerStatus.SUBMITTED}
        >
          Submit
        </LoadingButton>
  )
}


const QuestionsGrid = ({ evaluationId, evaluationToQuestion, onSubmit }) => {
  const theme = useTheme();

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
      header={
        {
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
                      <Typography variant="body1"><b>Q{row.order + 1}</b></Typography>
                      <QuestionTypeIcon type={row.question.type} withLabel size={22} />
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
              renderCell: (row) =>
                <Chip color="info" label={`${row.points} pts`} />,
            },
            {
              label: 'Status',
              column: { width: '120px' },
              renderCell: (row) => {
                const studentAsnwerStatus = row.question.studentAnswer[0].status;   

                const statusColor = (status) => statusMap[status].color
                const statusLabel = (status) => statusMap[status].label
                return (
                  <Typography variant="body2" color={statusColor(studentAsnwerStatus)}>
                    <b>{statusLabel(studentAsnwerStatus)}</b>
                  </Typography>
                )
              },
            }
          ]
        }
      }
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
