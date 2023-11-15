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

  const { groupScope, evaluationId, userEmail, questionPage } = router.query

  const { data: evaluation, error } = useSWR(
    `/api/${groupScope}/evaluation/${evaluationId}/consult/${userEmail}`,
      groupScope && evaluationId && userEmail ? fetcher : null,
    { revalidateOnFocus: true, refreshInterval: 5000 }
  )
  const [evaluationToQuestions, setEvaluationToQuestions] = useState([])
  const [selected, setSelected] = useState()

  useEffect(() => {
    if (
      evaluation &&
      evaluation.evaluationToQuestions &&
      evaluation.evaluationToQuestions.length > 0
    ) {
      setEvaluationToQuestions(evaluation.evaluationToQuestions)
      setSelected(evaluation.evaluationToQuestions[questionPage - 1])
    }
  }, [evaluation, questionPage])

  useEffect(() => {
    if (evaluationToQuestions && evaluationToQuestions.length > 0) {
      setSelected(evaluationToQuestions[questionPage - 1])
    }
  }, [questionPage, evaluationToQuestions])

  const questionPages = useMemo(() => evaluationToQuestions.map(jstq => ({ id:
    jstq.question.id,
    tooltip: `${jstq.question.title} - ${jstq.points} points`,
    isFilled: jstq.question.studentAnswer[0]?.status === StudentAnswerStatus.SUBMITTED
  })), [evaluationToQuestions])

  const isDataReady = useMemo(() => evaluationToQuestions.length > 0 && selected && selected.question.studentAnswer[0], [evaluationToQuestions, selected])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!evaluation} error={[error]}>
        {isDataReady && (
          <LayoutMain
            hideLogo
            header={
              <Stack direction="row" alignItems="center">
                <BackButton backUrl={`/${groupScope}/evaluation/${evaluationId}`} />
                { selected && (
                  <UserAvatar user={selected.question.studentAnswer[0].user} />
                )}
                <Stack flex={1} sx={{ overflow: 'hidden' }}>
                  <Paging
                    items={questionPages}
                    active={selected?.question}
                    link={(_, questionIndex) =>
                      `/${groupScope}/evaluation/${evaluationId}/consult/${userEmail}/${questionIndex + 1}`
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
                  footer={selected.question.studentAnswer[0].studentGrading.signedBy && 
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
