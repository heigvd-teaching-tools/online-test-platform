import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import { JamSessionPhase, Role, StudentAnswerStatus} from '@prisma/client';
import { useSession } from "next-auth/react";

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../../layout/LayoutSplitScreen';
import LoadingAnimation from "../../../feedback/LoadingAnimation";
import QuestionPages from '../../take/QuestionPages';

import JamSessionCountDown from '../../in-progress/JamSessionCountDown';

import QuestionView from '../../../question/QuestionView';
import QuestionNav from '../../take/QuestionNav';
import AnswerEditor from '../../../answer/AnswerEditor';

import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import LayoutMain from "../../../layout/LayoutMain";
import {ResizeObserverProvider} from "../../../../context/ResizeObserverContext";

const PageTakeJam = () => {
    const router = useRouter();
    const { jamSessionId, pageId } = router.query;

    const { data: session } = useSession();

    const { data:jamSessionPhase } = useSWR(
        `/api/jam-sessions/${jamSessionId}/phase`,
        jamSessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { refreshInterval  : 2000 }
    );

    useEffect(() => {
        // Redirect to wait page if collections session is not in progress
        if(jamSessionPhase && jamSessionPhase.phase !== JamSessionPhase.IN_PROGRESS){
            router.push(`/jam-sessions/${jamSessionId}/wait`);
        }
    }, [jamSessionPhase, router]);

    const { data: userOnJamSession, error, mutate } = useSWR(
        `/api/users/jam-sessions/${jamSessionId}/take`,
        session && jamSessionId ?
            (...args) =>
                fetch(...args)
                .then((res) => {
                    if(!res.ok){
                        switch(res.status){
                            case 403:
                                throw new Error('You are not allowed to access this collections session');
                            default:
                                throw new Error('An error occurred while fetching the data.');
                        }
                    }
                    return res.json();
                })
            : null,
            { revalidateOnFocus: false }
    );

    const [ page, setPage ] = useState(parseInt(pageId));

    const [ questions, setQuestions ] = useState([]);

    useEffect(() => {
        if(userOnJamSession){
            setQuestions(userOnJamSession.questions);
        }
    }, [userOnJamSession]);

    useEffect(() => {
        setPage(parseInt(pageId));
    }, [pageId]);


    const hasAnswered = useCallback((questionId) => questions.find(q => q.id === questionId)?.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED, [questions]);

    if(error) return <LoadingAnimation content={error.message} />
    if (!userOnJamSession) return <LoadingAnimation />
    if(userOnJamSession && userOnJamSession.phase !== JamSessionPhase.IN_PROGRESS) {
        let text = userOnJamSession.label ? `${userOnJamSession.label} is not in progress.` : 'This session is not in progress.';
        return <LoadingAnimation text={text} />;
    }

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            <StudentPhaseRedirect phase={userOnJamSession.phase}>
                <LayoutMain
                    header={
                        <Stack direction="row" alignItems="center">
                            { userOnJamSession.startAt && userOnJamSession.endAt && (
                                <Box sx={{ ml:2 }}>
                                    <JamSessionCountDown startDate={userOnJamSession.startAt} endDate={userOnJamSession.endAt} />
                                </Box>
                            )}
                            {questions && questions.length > 0 && (
                                <QuestionPages
                                    questions={questions}
                                    activeQuestion={questions[page - 1]}
                                    link={(_, index) => `/jam-sessions/${router.query.sessionId}/take/${index + 1}`}
                                    isFilled={hasAnswered}
                                />
                            )}
                        </Stack>
                    }
                    >
                    <LayoutSplitScreen
                        leftPanel={
                            questions && questions.length > 0 && questions[page - 1] && (
                            <>
                                <Box sx={{ height: 'calc(100% - 50px)' }}>
                                    <QuestionView
                                        question={questions[page - 1]}
                                        page={page}
                                        totalPages={questions.length}
                                    />
                                </Box>
                                <QuestionNav
                                    page={page}
                                    totalPages={questions.length}
                                />
                            </>
                        )}
                        rightPanel={
                            questions && questions.length > 0 && questions.map((q, index) => (
                                <Box height="100%" display={(index + 1 === page) ? 'block' : 'none'}>
                                    <ResizeObserverProvider>
                                        <AnswerEditor
                                            question={questions[page - 1]}
                                            onAnswer={(question, updatedStudentAnswer) => {
                                                /* update the student answer status in memory */
                                                question.studentAnswer[0].status = updatedStudentAnswer.status;
                                                /* change the state to trigger a re-render */
                                                setQuestions([...questions]);
                                            }}
                                        />
                                    </ResizeObserverProvider>
                                </Box>
                            )
                        )}
                    />
                </LayoutMain>
            </StudentPhaseRedirect>
        </Authorisation>
    )
}

export default PageTakeJam;
