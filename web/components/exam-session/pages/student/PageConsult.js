import { useRouter } from "next/router";
import useSWR from "swr";
import { Role } from "@prisma/client";
import Authorisation from "../../../security/Authorisation";
import LayoutSplitScreen from "../../../layout/LayoutSplitScreen";
import {Paper, Stack} from "@mui/material";
import QuestionPages from "../../take/QuestionPages";
import {useEffect, useState} from "react";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import QuestionView from "../../take/QuestionView";
import AnswerCompare from "../../../answer/AnswerCompare";
import GradingSigned from "../../grading/GradingSigned";
import GradingPointsComment from "../../grading/GradingPointsComment";

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
        if(examSession){
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
                            <LayoutSplitScreen
                                header={
                                    <Stack direction="row" alignItems="center">
                                        <Stack flex={1} sx={{ overflow:'hidden' }}>
                                            <QuestionPages
                                                questions={questions}
                                                activeQuestion={question}
                                                link={(questionId, questionIndex) => `/exam-sessions/${router.query.sessionId}/consult/${questionIndex + 1}`}
                                                isFilled={(questionId) => {
                                                    const question = questions.find((q) => q.id === questionId);
                                                    return question && question.studentAnswer[0].studentGrading.signedBy;
                                                }}
                                            />
                                        </Stack>
                                    </Stack>
                                }
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
                                    <Stack direction="row" sx={{ position:'relative', height:'100%', overflowX:'auto', pt:1  }}>
                                        {
                                         question && (
                                            <AnswerCompare
                                                question={question}
                                                answer={question.studentAnswer[0]}
                                            />
                                        )}
                                    </Stack>
                                }
                                footerHeight={90}
                                footer={
                                    <Stack direction="row" justifyContent="center" sx={{ height:'100%' }}>
                                        {question && (
                                            <Paper sx={{ flex:1 }} square>
                                                <Stack spacing={1} direction="row" justifyContent="center" alignItems="center" sx={{ height:'100%' }}>
                                                    <GradingSigned
                                                        signedBy={question.studentAnswer[0].studentGrading.signedBy}
                                                        readOnly={true}
                                                    />
                                                    <GradingPointsComment
                                                        points={question.studentAnswer[0].studentGrading.pointsObtained}
                                                        maxPoints={question.points}
                                                        comment={question.studentAnswer[0].studentGrading.comment}
                                                    />
                                                </Stack>
                                            </Paper>
                                        )}
                                        </Stack>
                                }

                            />
                    )}
                </StudentPhaseRedirect>
            )}


        </Authorisation>
    );
}

export default PageConsult;