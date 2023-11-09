import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Authorisation from "../../security/Authorisation"
import Loading from "../../feedback/Loading"
import { Role, StudentAnswerStatus } from "@prisma/client"
import { fetcher } from "../../../code/utils"
import LayoutMain from "../../layout/LayoutMain"
import { Paper, Stack } from "@mui/material"
import Paging from "../../layout/utils/Paging"
import LayoutSplitScreen from "../../layout/LayoutSplitScreen"
import QuestionView from "../../question/QuestionView"
import GradingSigned from "../grading/GradingSigned"
import GradingPointsComment from "../grading/GradingPointsComment"
import AlertFeedback from "../../feedback/AlertFeedback"
import BackButton from "../../layout/BackButton"
import UserAvatar from "../../layout/UserAvatar"
import AnswerCompare from "../../answer/AnswerCompare"


const PageProfConsult = () => {
  const router = useRouter()

  const { groupScope, jamSessionId, userEmail, questionPage } = router.query

  const { data: jamSession, error } = useSWR(
    `/api/${groupScope}/jam-sessions/${jamSessionId}/consult/${userEmail}`,
      groupScope && jamSessionId && userEmail ? fetcher : null,
    { revalidateOnFocus: false }
  )
  const [jamSessionToQuestions, setJamSessionToQuestions] = useState([])
  const [selected, setSelected] = useState()

  useEffect(() => {
    if (
      jamSession &&
      jamSession.jamSessionToQuestions &&
      jamSession.jamSessionToQuestions.length > 0
    ) {
      setJamSessionToQuestions(jamSession.jamSessionToQuestions)
      setSelected(jamSession.jamSessionToQuestions[questionPage - 1])
    }
  }, [jamSession, questionPage])

  useEffect(() => {
    if (jamSessionToQuestions && jamSessionToQuestions.length > 0) {
      setSelected(jamSessionToQuestions[questionPage - 1])
    }
  }, [questionPage, jamSessionToQuestions])

  const questionPages = useMemo(() => jamSessionToQuestions.map(jstq => ({ id:
    jstq.question.id,
    tooltip: `${jstq.question.title} - ${jstq.points} points`,
    isFilled: jstq.question.studentAnswer[0]?.status === StudentAnswerStatus.SUBMITTED
  })), [jamSessionToQuestions])

  const isDataReady = useMemo(() => jamSessionToQuestions.length > 0 && selected && selected.question.studentAnswer[0], [jamSessionToQuestions, selected])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!jamSession} error={[error]}>
        {isDataReady && (
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/jam-sessions/${jamSessionId}/finished`} />
                { selected && (
                  <UserAvatar user={selected.question.studentAnswer[0].user} />
                )}
                <Stack flex={1} sx={{ overflow: 'hidden' }}>
                  <Paging
                    items={questionPages}
                    active={selected?.question}
                    link={(_, questionIndex) =>
                      `/${groupScope}/jam-sessions/${jamSessionId}/consult/${userEmail}/${questionIndex + 1}`
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
                        totalPages={jamSessionToQuestions.length}
                      />
                    )
                  }
                  rightWidth={65}
                  rightPanel={
                    selected && (
                      <Stack pt={1} height={'100%'}>
                      <AnswerCompare
                        id={`answer-viewer-${selected.question.id}`}
                        questionType={selected.question.type}
                        solution={selected.question[selected.question.type]}
                        answer={
                          selected.question.studentAnswer[0][
                            selected.question.type
                          ]
                        }
                      />
                      </Stack>
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
    </Authorisation>
  )
}

export default PageProfConsult
