import { useEffect, useState } from "react"
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
import ResizableDrawer from "@/components/layout/utils/ResizableDrawer"

const HomeSvgIcon = () => <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16"><g transform="translate(0, 0)"><path d="M6,14H2V2H12V5.5L14,7V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1V15a1,1,0,0,0,1,1H6Z" fill="#2196f3"></path><polygon points="12 8 8 11 8 16 11 16 11 13 13.035 13 13.035 16 16 16 16 11 12 8" fill="#2196f3" data-color="color-2"></polygon><rect x="4" y="4" width="6" height="1" fill="#2196f3"></rect><rect x="4" y="7" width="6" height="1" fill="#2196f3"></rect><rect x="4" y="10" width="3" height="1" fill="#2196f3"></rect></g></svg>

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

  const { data: userOnEvaluation, error: errorUserOnEvaluation } = useSWR(
    `/api/users/evaluations/${evaluationId}/take`,
    session && evaluationId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [page, setPage] = useState(parseInt(pageIndex))

  const [ pages, setPages ] = useState([])

  const [summaryOpen, setSummaryOpen] = useState(false)

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
        isFilled: jtq.question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED
      }))
      setPages([{ 
        id: 'home', 
        label: 'Home',
        icon: <Box mr={1}><HomeSvgIcon /></Box>,
      }, ...pages]);
    }
  }, [userOnEvaluation])

  useEffect(() => {
    setPage(parseInt(pageIndex))
  }, [pageIndex])

  const evaluationToQuestion = userOnEvaluation?.evaluationToQuestions;

  const activeQuestion = evaluationToQuestion && evaluationToQuestion[page -1] || null;

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
                          openSummary={() => setSummaryOpen(true)}
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
                      />
                    }
                    rightWidth={70}
                  />

                </LayoutMain>
                <SummaryGrid
                  summaryOpen={summaryOpen}
                  setSummaryOpen={setSummaryOpen}
                  evaluationId={evaluationId}
                  evaluationToQuestion={evaluationToQuestion}
                />
               </>
            )}

          </StudentPhaseRedirect>
        )}
      </Loading>


    </Authorisation>
  )
}

const SummaryGrid = ({ summaryOpen, setSummaryOpen, evaluationId, evaluationToQuestion }) => {
  return (
    <ResizableDrawer
      open={summaryOpen}
      width={50}
      onClose={() => setSummaryOpen(false)}
    >
      <Box p={2} width={"100%"} height={"100%"}>
      <ScrollContainer>
        <QuestionsGrid
          evaluationId={evaluationId}
          evaluationToQuestion={evaluationToQuestion}
        />
        </ScrollContainer>
      </Box>
    </ResizableDrawer>
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



const RightPanel = ({ evaluationId, page, evaluationToQuestion, setPages }) => {
   
  if(page === 0) {
    return (
      <Stack p={2}>

        <Typography variant="h5">Evaluation is composed of <b>{evaluationToQuestion.length}</b> questions having a total of <b>{evaluationToQuestion.reduce((acc, jtq) => acc + jtq.points, 0)}</b> pts.</Typography>

        <Stack spacing={1}>
            <QuestionsGrid
              evaluationId={evaluationId}
              evaluationToQuestion={evaluationToQuestion}
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
          display={index + 1 === page ? 'block' : 'none'}
        >
          <ResizeObserverProvider>
            <ScrollContainer>
              <AnswerEditor
                question={q.question}
                onAnswer={(question, updatedStudentAnswer) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = updatedStudentAnswer.status                  
                }}
                onSubmit={(question) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = StudentAnswerStatus.SUBMITTED
                  /* change the state to trigger a re-render */
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index + 1].isFilled = true
                    return newPages
                  })
                }}
                onUnsubmit={(question) => {
                  /* update the users answers status in memory */
                  question.studentAnswer[0].status = StudentAnswerStatus.IN_PROGRESS
                  /* change the state to trigger a re-render */
                  setPages((prevPages) => {
                    const newPages = [...prevPages]
                    newPages[index + 1].isFilled = false
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


const QuestionsGrid = ({ evaluationId, evaluationToQuestion }) => {
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
        },
      }))}
    />
  )
}

export default PageTakeEvaluation
