import { useEffect, useState, useCallback } from 'react';
import useSWR from "swr";
import { useRouter } from "next/router";

import { Stack, Pagination, PaginationItem, Button  } from "@mui/material";

import AlertFeedback from "../../../components/feedback/AlertFeedback";
import LoadingAnimation from "../../../components/layout/LoadingAnimation";
import StudentAnswer from "../../../components/answer/StudentAnswer";
import { useSnackbar } from '../../../context/SnackbarContext';

const TakeExam = () => {
    const { query: { sessionId }} = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${sessionId}`,
        sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: sessionQuestions, errorQuestions } = useSWR(
        `/api/exam-sessions/${sessionId}/questions/with-answers/student`,
        sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ page, setPage ] = useState(1);
    const [ questions, setQuestions ] = useState(undefined);

    useEffect(() => {
        if(sessionQuestions){
            setQuestions(sessionQuestions);
        }
    }, [sessionQuestions]);

    const onAnswer = useCallback((answer) => {
        (async () => {
            await fetch(`/api/exam-sessions/${sessionId}/questions/${questions[page - 1].id}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ answer: answer })
            })
            .then(_ => {
                questions[page - 1].studentAnswer = {
                    [questions[page - 1].type]: answer
                };
                if(answer === undefined){
                    delete questions[page - 1].studentAnswer;
                    showSnackbar('Your answer has been removed', 'success');
                }else{
                    showSnackbar('Answer submitted successfully', 'success');
                }
            }).catch(err => {
                console.log(err);
                showSnackbar('Error submitting answer', 'error');
            });
        })();
    }, [questions, page, sessionId, showSnackbar]);

    const hasAnswered = useCallback((page) => {
        let question = questions[page - 1];
        return question.studentAnswer && question.studentAnswer[question.type] !== undefined;
    }, [questions]);

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== 'IN_PROGRESS') return <LoadingAnimation text={`${examSession.label} is not in progress.`} />;       
    
    return (
        <Stack sx={{ minWidth:'90vw' }} spacing={4} pb={40}>
            { questions && questions.length > 0 && (
                <>
                <QuestionPages count={questions.length} page={page} setPage={setPage} hasAnswered={hasAnswered} />
                {questions[page - 1] && (
                    <StudentAnswer
                        question={questions[page - 1]}
                        page={page} 
                        onAnswer={onAnswer}
                    />
                )}
                <Stack direction="row" justifyContent="space-between">
                    <Button color="primary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button color="primary" disabled={page === questions.length} onClick={() => setPage(page + 1)}>Next</Button>
                </Stack>
            </>
            )}
        </Stack>             
    )
}

const QuestionPages = ({ count, page, setPage, hasAnswered }) => {
    return (
        <Pagination 
            showFirstButton 
            showLastButton 
            siblingCount={15} 
            count={count} 
            page={page}
            variant="outlined" 
            color="primary" 
            renderItem={(item) => {
                let sx = {};
                let isAnswered = item.type === 'page' && hasAnswered(page);
                if(isAnswered) 
                    sx = { 
                        backgroundColor:    (theme) => theme.palette.success.light,
                        color:              (theme) => theme.palette.success.contrastText 
                    };
                return <PaginationItem {...item} color="secondary" sx={sx} />
            }}
            onChange={(e, page) => setPage(page)}
        />
    )
};

export default TakeExam;