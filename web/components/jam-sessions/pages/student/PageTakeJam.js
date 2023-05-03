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
        { refreshInterval  : 10000 }
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
        </Authorisation>
    )
}

export default PageTakeJam;
