import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { useSnackbar } from "../../../context/SnackbarContext"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { Role, StudentAnswerStatus } from "@prisma/client"
import { fetcher } from "../../../code/utils"
import Authorisation from "../../security/Authorisation"
import Loading from "../../feedback/Loading"
import StudentPhaseRedirect from "./StudentPhaseRedirect"
import LayoutMain from "../../layout/LayoutMain"
import { Box, Stack } from "@mui/material"
import JamSessionCountDown from "../../jam-sessions/in-progress/JamSessionCountDown"
import Paging from "../../layout/utils/Paging"
import LayoutSplitScreen from "../../layout/LayoutSplitScreen"
import QuestionView from "../../question/QuestionView"
import QuestionNav from "../../jam-sessions/take/QuestionNav"
import { ResizeObserverProvider } from "../../../context/ResizeObserverContext"
import ScrollContainer from "../../layout/ScrollContainer"
import AnswerEditor from "../../answer/AnswerEditor"
import React from "react"

const PageTakeJam = () => {
  const router = useRouter()

  const scrollContainerRef = useRef()

  const { showTopCenter: showSnackbar } = useSnackbar()

  const { jamSessionId, pageId } = router.query

  const { data: session } = useSession()

  const { data: jamSessionPhase, error: errorJamSessionPhase } = useSWR(
    `/api/jam-sessions/${jamSessionId}/phase`,
    jamSessionId ? fetcher : null,
    { refreshInterval: 1000 }
  )

  const { data: userOnJamSession, error: errorUserOnJamSession } = useSWR(
    `/api/users/jam-sessions/${jamSessionId}/take`,
    session && jamSessionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

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

  const [page, setPage] = useState(parseInt(pageId))

  const [ pages, setPages ] = useState([])

  useEffect(() => {
    if (userOnJamSession) {
      const pages = userOnJamSession.jamSessionToQuestions.map((jtq) => ({
        id: jtq.question.id,
        label: `Q${jtq.order}`,
        tooltip: `${jtq.question.type} "${jtq.question.title}" - ${jtq.points} points`,
        isFilled: jtq.question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED
      }))
      setPages(pages);
    }
  }, [userOnJamSession])

  useEffect(() => {
    setPage(parseInt(pageId))
  }, [pageId])


  const jamToQuestions = userOnJamSession?.jamSessionToQuestions;

  return (
    <Authorisation allowRoles={[Role.PROFESSOR, Role.STUDENT]}>
      
      <Loading loading={!jamSessionPhase} errors={[errorJamSessionPhase]}>
        {jamSessionPhase && (
          <StudentPhaseRedirect phase={jamSessionPhase.phase}>

            { userOnJamSession && (
                <LayoutMain
                    header={
                      <Loading
                        loading={!userOnJamSession}
                        errors={[errorUserOnJamSession]}
                        message={"Loading jam session..."}
                      >
                      <Stack direction="row" alignItems="center">
                        {userOnJamSession.startAt && userOnJamSession.endAt && (
                          <Box sx={{ ml: 2 }}>
                            <JamSessionCountDown
                              startDate={jamSessionPhase.startAt}
                              endDate={jamSessionPhase.endAt} 
                            />
                          </Box>
                        )}
                        {jamToQuestions && jamToQuestions.length > 0 && (
                          <Paging
                            items={pages}
                            active={pages[page - 1]}
                            link={(_, index) =>
                              `/student/jam-sessions/${jamSessionId}/take/${index + 1}`
                            }
                          />
                        )}
                      </Stack>
                      </Loading>
                    }
                >
                  <LayoutSplitScreen
                    leftPanel={
                      jamToQuestions &&
                      jamToQuestions.length > 0 &&
                      jamToQuestions[page - 1]?.question && (
                        <>
                          <QuestionView
                            order={jamToQuestions[page - 1].order}
                            points={jamToQuestions[page - 1].points}
                            question={jamToQuestions[page - 1].question}
                            page={page}
                            totalPages={jamToQuestions.length}
                          />
                          <QuestionNav
                            page={page}
                            totalPages={jamToQuestions.length}
                          />
                        </>
                      )
                    }
                    rightPanel={
                      jamToQuestions &&
                      jamToQuestions.length > 0 &&
                      jamToQuestions.map((q, index) => (
                        <Box
                          key={q.question.id}
                          height="100%"
                          display={index + 1 === page ? 'block' : 'none'}
                        >
                          <ResizeObserverProvider>
                            <ScrollContainer ref={scrollContainerRef}>
                              <AnswerEditor
                                question={q.question}
                                onAnswer={(question, updatedStudentAnswer) => {
                                  /* update the student answers status in memory */
                                  question.studentAnswer[0].status =
                                    updatedStudentAnswer.status
                                  /* change the state to trigger a re-render */
                                  setPages((prevPages) => {
                                    const newPages = [...prevPages]
                                    newPages[index].isFilled =
                                      updatedStudentAnswer.status ===
                                      StudentAnswerStatus.SUBMITTED
                                    return newPages
                                  })
                                }}
                              />
                            </ScrollContainer>
                          </ResizeObserverProvider>
                        </Box>
                      ))
                    }
                    rightWidth={70}
                  />
  
                </LayoutMain>

            )}

          </StudentPhaseRedirect>
        )}
      </Loading>

          
    </Authorisation>
  )
}

export default PageTakeJam
