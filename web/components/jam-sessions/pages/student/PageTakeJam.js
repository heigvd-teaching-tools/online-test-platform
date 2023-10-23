import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { JamSessionPhase, Role, StudentAnswerStatus } from '@prisma/client'
import { useSession } from 'next-auth/react'

import { Stack, Box } from '@mui/material'

import LayoutSplitScreen from '../../../layout/LayoutSplitScreen'
import JamSessionCountDown from '../../in-progress/JamSessionCountDown'

import QuestionView from '../../../question/QuestionView'
import QuestionNav from '../../take/QuestionNav'
import AnswerEditor from '../../../answer/AnswerEditor'

import Authorisation from '../../../security/Authorisation'
import StudentPhaseRedirect from './StudentPhaseRedirect'
import LayoutMain from '../../../layout/LayoutMain'
import { ResizeObserverProvider } from '../../../../context/ResizeObserverContext'

import { fetcher } from '../../../../code/utils'
import Loading from '../../../feedback/Loading'
import { useSnackbar } from '../../../../context/SnackbarContext'
import Paging from '../../../layout/utils/Paging'
import ScrollContainer from '../../../layout/ScrollContainer'

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

  useEffect(() => {
    // Redirect to wait page if collections session is not in progress
    if (
      jamSessionPhase &&
      jamSessionPhase.phase !== JamSessionPhase.IN_PROGRESS
    ) {
      router.push(`/jam-sessions/${jamSessionId}/wait`)
    }
  }, [jamSessionId, jamSessionPhase, router])

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
        tooltip: jtq.question.title,
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
      <Loading
        loading={!jamSessionPhase || !userOnJamSession}
        errors={[errorJamSessionPhase, errorUserOnJamSession]}
        message={"Loading jam session..."}
      >
        {userOnJamSession && (
          <StudentPhaseRedirect phase={userOnJamSession.phase}>
            <LayoutMain
              header={
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
                        `/jam-sessions/${jamSessionId}/take/${index + 1}`
                      }
                    />
                  )}
                </Stack>
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
              />
            </LayoutMain>
          </StudentPhaseRedirect>
        )}
      </Loading>
    </Authorisation>
  )
}

export default PageTakeJam
