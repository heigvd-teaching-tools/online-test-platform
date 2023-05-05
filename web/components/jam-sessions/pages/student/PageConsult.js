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
import Loading from "../../../feedback/Loading";

const PageConsult = () => {
    const router = useRouter();
    const { jamSessionId, questionPage } = router.query;

    const { data: jamSession, error } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/consult`,
        jamSessionId ? fetcher : null,
        { revalidateOnFocus : false }
    );
    const [ jamSessionToQuestions, setJamSessionToQuestions ] = useState([]);
    const [ selected, setSelected ] = useState();


    useEffect(() => {
        if(jamSession && jamSession.jamSessionToQuestions && jamSession.jamSessionToQuestions.length > 0) {
            setJamSessionToQuestions(jamSession.jamSessionToQuestions)
            setSelected(jamSession.jamSessionToQuestions[questionPage - 1]);
        }
    }, [jamSession]);

    useEffect(() => {
        if (jamSessionToQuestions && jamSessionToQuestions.length > 0) {
            setSelected(jamSessionToQuestions[questionPage - 1]);
        }
    }, [questionPage]);

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            <Loading
                loading={!jamSession}
                error={[error]}
                >
                { jamSession && (
                    <StudentPhaseRedirect phase={jamSession.phase}>
                        { jamSessionToQuestions && selected && (
                            <LayoutMain
                                header={
                                    <Stack direction="row" alignItems="center">
                                        <Stack flex={1} sx={{ overflow:'hidden' }}>
                                            <QuestionPages
                                                questions={jamSessionToQuestions.map((jstq) => jstq.question)}
                                                activeQuestion={selected.question}
                                                link={(questionId, questionIndex) => `/jam-sessions/${jamSessionId}/consult/${questionIndex + 1}`}
                                            />
                                        </Stack>
                                    </Stack>
                                }>
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
                                            <AnswerConsult
                                                id={`answer-viewer-${selected.question.id}`}
                                                questionType={selected.question.type}
                                                question={selected.question}
                                                answer={selected.question.studentAnswer[0][selected.question.type]}
                                            />
                                        )
                                    }
                                    footer={
                                    <>  {
                                        selected && (
                                            <Paper sx={{ height:"80px" }} square>
                                                <Stack spacing={2} direction="row" justifyContent="center" alignItems="center" height='100%'>
                                                    { selected.question.studentAnswer[0].studentGrading.signedBy ? (
                                                        <>
                                                            <GradingSigned
                                                                signedBy={selected.question.studentAnswer[0].studentGrading.signedBy}
                                                                readOnly={true}
                                                            />
                                                            <GradingPointsComment
                                                                points={selected.question.studentAnswer[0].studentGrading.pointsObtained}
                                                                maxPoints={selected.points}
                                                                comment={selected.question.studentAnswer[0].studentGrading.comment}
                                                            />
                                                        </>
                                                    ) : (
                                                        <AlertFeedback severity="warning" >This question has not been graded yet.</AlertFeedback>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        )
                                        }</>
                                    }

                                />
                            </LayoutMain>
                        )}
                    </StudentPhaseRedirect>
                )}
            </Loading>
        </Authorisation>
    );
};

export default PageConsult;
