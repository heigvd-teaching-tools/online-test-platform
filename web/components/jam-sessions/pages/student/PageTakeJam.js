import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { JamSessionPhase, Role, StudentAnswerStatus} from '@prisma/client';
import { useSession } from "next-auth/react";

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../../layout/LayoutSplitScreen';
import QuestionPages from '../../take/QuestionPages';

import JamSessionCountDown from '../../in-progress/JamSessionCountDown';

import QuestionView from '../../../question/QuestionView';
import QuestionNav from '../../take/QuestionNav';
import AnswerEditor from '../../../answer/AnswerEditor';

import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import LayoutMain from "../../../layout/LayoutMain";
import {ResizeObserverProvider} from "../../../../context/ResizeObserverContext";

import { fetcher } from "../../../../code/utils";
import Loading from "../../../feedback/Loading";

const PageTakeJam = () => {
    const router = useRouter();
    const { jamSessionId, pageId } = router.query;

    const { data: session } = useSession();

    const { data:jamSessionPhase, error: errorJamSessionPhase } = useSWR(
        `/api/jam-sessions/${jamSessionId}/phase`,
        jamSessionId ? fetcher : null,
        { refreshInterval  : 1000 }
    );

    useEffect(() => {
        // Redirect to wait page if collections session is not in progress
        if(jamSessionPhase && jamSessionPhase.phase !== JamSessionPhase.IN_PROGRESS){
            router.push(`/jam-sessions/${jamSessionId}/wait`);
        }
    }, [jamSessionId, jamSessionPhase, router]);

    const { data: userOnJamSession, error: errorUserOnJamSession } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/take`,
        session && jamSessionId ? fetcher : null,
        { revalidateOnFocus: false }
    );

    const [ page, setPage ] = useState(parseInt(pageId));

    const [ jamToQuestions, setJamToQuestions ] = useState([]);

    useEffect(() => {
        if(userOnJamSession){
            setJamToQuestions(userOnJamSession.jamSessionToQuestions);
        }
    }, [userOnJamSession]);

    useEffect(() => {
        setPage(parseInt(pageId));
    }, [pageId]);


    const hasAnswered = useCallback((questionId) => jamToQuestions.find(jtq => jtq.question.id === questionId)?.question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED, [jamToQuestions]);

    console.log("userOnJamSession", userOnJamSession, errorUserOnJamSession)

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            <Loading
                loading={!jamSessionPhase || !userOnJamSession}
                errors={[errorJamSessionPhase, errorUserOnJamSession]}
            >
               { userOnJamSession && (
                    <StudentPhaseRedirect phase={userOnJamSession.phase}>
                    <LayoutMain
                        header={
                            <Stack direction="row" alignItems="center">
                                { userOnJamSession.startAt && userOnJamSession.endAt && (
                                    <Box sx={{ ml:2 }}>
                                        <JamSessionCountDown startDate={userOnJamSession.startAt} endDate={userOnJamSession.endAt} />
                                    </Box>
                                )}
                                {jamToQuestions && jamToQuestions.length > 0 && (
                                    <QuestionPages
                                        questions={jamToQuestions.sort(jtq => jtq.order).map(jtq => jtq.question)}
                                        activeQuestion={jamToQuestions[page - 1].question}
                                        link={(_, index) => `/jam-sessions/${jamSessionId}/take/${index + 1}`}
                                        isFilled={hasAnswered}
                                    />
                                )}
                            </Stack>
                        }
                        >
                        <LayoutSplitScreen
                            leftPanel={
                                jamToQuestions && jamToQuestions.length > 0 && jamToQuestions[page - 1]?.question && (
                                <>
                                    <Box sx={{ height: 'calc(100% - 50px)' }}>
                                        <QuestionView
                                            order={jamToQuestions[page - 1].order}
                                            points={jamToQuestions[page - 1].points}
                                            question={jamToQuestions[page - 1].question}
                                            page={page}
                                            totalPages={jamToQuestions.length}
                                        />
                                    </Box>
                                    <QuestionNav
                                        page={page}
                                        totalPages={jamToQuestions.length}
                                    />
                                </>
                            )}
                            rightPanel={
                                jamToQuestions && jamToQuestions.length > 0 && jamToQuestions.map((q, index) => (
                                    <Box key={q.question.id} height="100%" display={(index + 1 === page) ? 'block' : 'none'}>
                                        <ResizeObserverProvider>
                                            <AnswerEditor
                                                question={q.question}
                                                onAnswer={(question, updatedStudentAnswer) => {
                                                    /* update the student answers status in memory */
                                                    question.studentAnswer[0].status = updatedStudentAnswer.status;
                                                    /* change the state to trigger a re-render */
                                                    setJamToQuestions([...jamToQuestions]);
                                                }}
                                            />
                                        </ResizeObserverProvider>
                                    </Box>
                                )
                            )}
                        />
                    </LayoutMain>
                </StudentPhaseRedirect>
               )}  
            </Loading>
        </Authorisation>
    )
}

export default PageTakeJam;
