import { useRouter } from "next/router";
import useSWR from "swr";
import { Role } from "@prisma/client";
import Authorisation from "../../../security/Authorisation";
import LayoutSplitScreen from "../../../layout/LayoutSplitScreen";
import {Paper, Stack} from "@mui/material";
import QuestionPages from "../../take/QuestionPages";
import {useEffect, useState} from "react";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import QuestionView from "../../../question/QuestionView";
import GradingSigned from "../../grading/GradingSigned";
import GradingPointsComment from "../../grading/GradingPointsComment";
import LayoutMain from "../../../layout/LayoutMain";
import AnswerConsult from "../../../answer/AnswerConsult";
import AlertFeedback from "../../../feedback/AlertFeedback";

const PageConsult = () => {
    const router = useRouter();
    const { jamSessionId, questionPage } = router.query;

    const { data: jamSession } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/consult`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus : false }
    );
    const [ questions, setQuestions ] = useState([]);
    const [ question, setQuestion ] = useState();

    useEffect(() => {
        if(jamSession && jamSession.questions && jamSession.questions.length > 0) {
            setQuestions(jamSession.questions)
            setQuestion(jamSession.questions[questionPage - 1]);
        }
    }, [jamSession]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setQuestion(questions[questionPage - 1]);
        }
    }, [questionPage]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            { jamSession && (
                <StudentPhaseRedirect phase={jamSession.phase}>
                    { questions && (
                        <LayoutMain
                            header={
                                <Stack direction="row" alignItems="center">
                                    <Stack flex={1} sx={{ overflow:'hidden' }}>
                                        <QuestionPages
                                            questions={questions}
                                            activeQuestion={question}
                                            link={(questionId, questionIndex) => `/jam-sessions/${jamSessionId}/consult/${questionIndex + 1}`}
                                        />
                                    </Stack>
                                </Stack>
                            }>
                            <LayoutSplitScreen
                                leftPanel={
                                    question && (
                                        <QuestionView
                                            question={question}
                                            totalPages={questions.length}
                                        />
                                    )
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
                                    question && (
                                        <Paper sx={{ height:"80px" }} square>
                                            <Stack spacing={2} direction="row" justifyContent="center" alignItems="center" height='100%'>                                                    { question.studentAnswer[0].studentGrading.signedBy ? (
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
                                    )
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
