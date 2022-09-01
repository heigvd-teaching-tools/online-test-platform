import { useEffect, useState } from 'react';
import Image from 'next/image';
import LoadingAnimation from "../../../components/layout/LoadingAnimation";
import { useRouter } from "next/router";
import useSWR from "swr";
import AlertFeedback from "../../../components/feedback/Alert";
import { Typography, Stack, Pagination, PaginationItem, Box, Paper, Button  } from "@mui/material";
import Row from '../../../components/layout/Row';
import Column from '../../../components/layout/Column';
import TrueFalse from '../../../components/question/type_specific/TrueFalse';
import { useSnackbar } from '../../../context/SnackbarContext';

const TakeExam = () => {
    const { query: { sessionId }} = useRouter();
    const { show: showSnackbar } = useSnackbar();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${sessionId}`,
        sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: sessionQuestions, errorQuestions } = useSWR(
        `/api/exam-sessions/${sessionId}/questions/no-answer`,
        sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const [ page, setPage ] = useState(1);
    const [ questions, setQuestions ] = useState(undefined);
    const [ question, setQuestion ] = useState(undefined);

    useEffect(() => {
        if(sessionQuestions){
            console.log(sessionQuestions);
            setQuestions(sessionQuestions);
        }
    }, [sessionQuestions]);

    useEffect(() => {
        if(questions){
            setQuestion(questions[page - 1]);
        }
    }, [questions, page]);

    const answer = async (index, answer) => {
        const newQuestions = [...questions];
        newQuestions[index].answer = answer;
        setQuestions(newQuestions);
        await fetch(`/api/exam-sessions/${sessionId}/questions/${newQuestions[index].id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ answer })
        })
        .then(res => res.json())
        .then(_ => {
            showSnackbar('Answer submitted successfully', 'success');
        }).catch(_ => {
            showSnackbar('Error submitting answer', 'error');
        });

    }

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== 'IN_PROGRESS') return <LoadingAnimation text={`${examSession.label} is not in progress.`} />;       
    return (
        <Stack sx={{ minWidth:'90vw' }} spacing={4} pb={40}>
            { questions && questions.length > 0 && (
                <>
                <Pagination 
                showFirstButton 
                showLastButton 
                siblingCount={15} 
                count={questions.length} 
                page={page}
                variant="outlined" 
                color="primary" 
                renderItem={(item) => {
                    let sx = {};
                    let isAnswered = item.type === 'page' && questions[item.page-1].answer;
                    if(isAnswered) 
                        sx = { 
                            backgroundColor:    (theme) => theme.palette.success.light,
                            color:              (theme) => theme.palette.success.contrastText 
                        };
                    return <PaginationItem {...item} color={isAnswered ? "secondary" : "primary"} sx={sx} />
                }}
                onChange={(e, page) => setPage(page)}
                />
                { 
                    question && (
                    <Stack spacing={4} direction="column">
                    <Paper sx={{ p:2 }}>
                        <Row>
                            <Column width="32px">
                                <Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                            </Column>
                            <Column>
                                <Typography variant="h5">Q{page}</Typography>
                            </Column>
                            <Column>
                                <Typography variant="body1">{displayQuestionType(question.type)}</Typography>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Typography variant="body1">{question.content}</Typography>
                            </Column>
                        </Row>
                    </Paper>
                    <Paper sx={{ p:2 }}>
                        <Stack direction="row" justifyContent="space-between">
                            <TrueFalse content={question.answer ? question.answer.trueFalse : null} onChange={(content) => answer(page - 1, content)} />
                        </Stack>
                    </Paper>
                    <Stack direction="row" justifyContent="space-between">
                        <Button color="primary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                        <Button color="primary" disabled={page === questions.length} onClick={() => setPage(page + 1)}>Next</Button>
                    </Stack>
                    </Stack>
                )}
            </>
            )}
        </Stack>             
    )
}

const displayQuestionType = (type) => {
    switch(type){
        case 'multipleChoice':
            return "Multiple Choice";
        case 'essay':
            return "Essay";
        case 'trueFalse':
            return "True/False";
        case 'code':
            return "Code";
        default:
            return "N/A";
    }
}

export default TakeExam;