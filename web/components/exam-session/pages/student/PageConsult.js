import { useRouter } from "next/router";
import useSWR from "swr";
import { Role } from "@prisma/client";
import Authorisation from "../../../security/Authorisation";
import LayoutSplitScreen from "../../../layout/LayoutSplitScreen";
import {Paper, Stack, Typography} from "@mui/material";
import QuestionPages from "../../take/QuestionPages";
import {useEffect, useState} from "react";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import QuestionView from "../../../question/QuestionView";
import GradingSigned from "../../grading/GradingSigned";
import GradingPointsComment from "../../grading/GradingPointsComment";
import LayoutMain from "../../../layout/LayoutMain";
import {ResizeObserverProvider} from "../../../../context/ResizeObserverContext";
import AnswerConsult from "../../../answer/AnswerConsult";
import AlertFeedback from "../../../feedback/AlertFeedback";

const PageConsult = () => {
    const router = useRouter();

    const { data: examSession } = useSWR(
        `/api/users/exam-sessions/${router.query.sessionId}/consult`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );
    const [ questions, setQuestions ] = useState([]);
    const [ question, setQuestion ] = useState();

    useEffect(() => {
        if(examSession && examSession.questions && examSession.questions.length > 0) {
            setQuestions(examSession.questions)
            setQuestion(examSession.questions[router.query.questionPage - 1]);
        }
    }, [examSession]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setQuestion(questions[router.query.questionPage - 1]);
        }
    }, [router.query.questionPage]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            { examSession && (
                <StudentPhaseRedirect phase={examSession.phase}>
                    { questions && (
                        <LayoutMain
                            header={
                                <Stack direction="row" alignItems="center">
                                    <Stack flex={1} sx={{ overflow:'hidden' }}>
                                        <QuestionPages
                                            questions={questions}
                                            activeQuestion={question}
                                            link={(questionId, questionIndex) => `/exam-sessions/${router.query.sessionId}/consult/${questionIndex + 1}`}
                                        />
                                    </Stack>
                                </Stack>
                            }>
                            <LayoutSplitScreen
                                leftPanel={
                                    <Stack direction="row" sx={{ position:'relative', height:'100%' }}>
                                        { question && (
                                            <QuestionView
                                                question={question}
                                                totalPages={questions.length}
                                            />
                                        )}
                                    </Stack>
                                }
                                rightWidth={65}
                                rightPanel={
                                     question && (
                                        <AnswerConsult
                                            id={`answer-viewer-${question.id}`}
                                            questionType={question.type}
                                            solution={question[question.type]}
                                            answer={question.studentAnswer[0][question.type]}
                                        />
                                    )
                                }
                                footer={
                                    <Stack direction="row" height="100px">
                                        {question && (
                                            <Paper sx={{ flex:1 }} square>
                                                <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center" sx={{ height:'100%' }}>
                                                    { question.studentAnswer[0].studentGrading.signedBy ? (
                                                        <>
                                                            <GradingSigned
                                                                signedBy={question.studentAnswer[0].studentGrading.signedBy}
                                                                readOnly={true}
                                                            />
                                                            <GradingPointsComment
                                                                points={question.studentAnswer[0].studentGrading.pointsObtained}
                                                                maxPoints={question.points}
                                                                comment={question.studentAnswer[0].studentGrading.comment}
                                                            />
                                                        </>
                                                    ) : (
                                                        <AlertFeedback severity="warning" >This question has not been graded yet.</AlertFeedback>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        )}
                                    </Stack>
                                }

                            />
                        </LayoutMain>
                    )}
                </StudentPhaseRedirect>
            )}


        </Authorisation>
    );
}

export default PageConsult;
