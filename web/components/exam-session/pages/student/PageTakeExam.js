import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";
import {ExamSessionPhase, Role, StudentAnswerStatus} from '@prisma/client';
import { useSession } from "next-auth/react";

import { Stack, Box } from "@mui/material";

import LayoutSplitScreen from '../../../layout/LayoutSplitScreen';
import LoadingAnimation from "../../../feedback/LoadingAnimation";
import QuestionPages from '../../take/QuestionPages';
import { useSnackbar } from '../../../../context/SnackbarContext';
import ExamSessionCountDown from '../../in-progress/ExamSessionCountDown';

import QuestionView from '../../../question/QuestionView';
import QuestionNav from '../../take/QuestionNav';
import AnswerEditor from '../../../answer/AnswerEditor';

import Authorisation from "../../../security/Authorisation";
import StudentPhaseRedirect from "./StudentPhaseRedirect";
import LayoutMain from "../../../layout/LayoutMain";
import {ResizeObserverProvider} from "../../../../context/ResizeObserverContext";

const PageTakeExam = () => {
    const router = useRouter();
    const { showTopRight: showSnackbar } = useSnackbar();
    const { data: session } = useSession();

    const { data:examSessionPhase } = useSWR(
        `/api/exam-sessions/${router.query.sessionId}/phase`,
        router.query.sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { refreshInterval  : 2000 }
    );

    useEffect(() => {
        // Redirect to wait page if exam session is not in progress
        if(examSessionPhase && examSessionPhase.phase !== ExamSessionPhase.IN_PROGRESS){
            router.push(`/exam-sessions/${router.query.sessionId}/wait`);
        }
    }, [examSessionPhase, router]);

    const { data: userOnExamSession, error, mutate } = useSWR(
        `/api/users/exam-sessions/${router.query.sessionId}/take`,
        session && router.query.sessionId ?
            (...args) =>
                fetch(...args)
                .then((res) => {
                    if(!res.ok){
                        switch(res.status){
                            case 403:
                                throw new Error('You are not allowed to access this exam session');
                            default:
                                throw new Error('An error occurred while fetching the data.');
                        }
                    }
                    return res.json();
                })
            : null,
            { revalidateOnFocus: false }
    );

    const [ page, setPage ] = useState(parseInt(router.query.pageId));

    const [ questions, setQuestions ] = useState([]);

    useEffect(() => {
        if(userOnExamSession){
            setQuestions(userOnExamSession.questions);
        }
    }, [userOnExamSession]);

    useEffect(() => {
        setPage(parseInt(router.query.pageId));
    }, [router.query.pageId]);


    const hasAnswered = useCallback((questionId) => questions.find(q => q.id === questionId)?.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED, [questions]);

    if(error) return <LoadingAnimation content={error.message} />
    if (!userOnExamSession) return <LoadingAnimation />
    if(userOnExamSession && userOnExamSession.phase !== ExamSessionPhase.IN_PROGRESS) {
        let text = userOnExamSession.label ? `${userOnExamSession.label} is not in progress.` : 'This exam session is not in progress.';
        return <LoadingAnimation text={text} />;
    }

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR, Role.STUDENT ]}>
            <StudentPhaseRedirect phase={userOnExamSession.phase}>
                <LayoutMain
                    header={
                        <Stack direction="row" alignItems="center">
                            { userOnExamSession.startAt && userOnExamSession.endAt && (
                                <Box sx={{ ml:2 }}>
                                    <ExamSessionCountDown startDate={userOnExamSession.startAt} endDate={userOnExamSession.endAt} />
                                </Box>
                            )}
                            {questions && questions.length > 0 && (
                                <QuestionPages
                                    questions={questions}
                                    activeQuestion={questions[page - 1]}
                                    link={(_, index) => `/exam-sessions/${router.query.sessionId}/take/${index + 1}`}
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

export default PageTakeExam;
