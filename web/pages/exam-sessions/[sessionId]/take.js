import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import LoadingAnimation from "../../../components/layout/LoadingAnimation";
import { useRouter } from "next/router";
import useSWR from "swr";
import AlertFeedback from "../../../components/feedback/Alert";
import { Typography, Stack, Pagination, PaginationItem, Box, Paper, Button, Chip  } from "@mui/material";
import Row from '../../../components/layout/Row';
import Column from '../../../components/layout/Column';
import TrueFalse from '../../../components/question/type_specific/TrueFalse';
import MultipleChoice from '../../../components/question/type_specific/MultipleChoice';
import Essay from '../../../components/question/type_specific/Essay';
import { useSnackbar } from '../../../context/SnackbarContext';
import { ConstructionOutlined } from '@mui/icons-material';

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

    const hasAnswered = useCallback((question) => {
        return question.studentAnswer && question.studentAnswer[question.type] !== undefined;
    }, []);

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
                    let isAnswered = item.type === 'page' && hasAnswered(questions[item.page - 1]);
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
                    questions[page - 1] && (
                    <Stack spacing={4} direction="column">
                        <Paper sx={{ p:2 }}>
                            <Row>
                                <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${questions[page - 1].type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                                <Column><Typography variant="h5">Q{page}</Typography></Column>
                                <Column right><Typography variant="body1">{displayQuestionType(questions[page - 1].type)}</Typography></Column>
                                <Column flexGrow={1} right><Chip color="info" label={`${questions[page - 1].points} pts`} /></Column>
                            </Row>
                            <Row>
                                <Column><Typography variant="body1">{questions[page - 1].content}</Typography></Column>
                            </Row>
                        </Paper>
                        <StudentAnswer 
                            question={questions[page - 1]}
                            onAnswer={onAnswer} 
                        />
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

const StudentAnswer = ({ question, onAnswer }) => {

    const [ answer, setAnswer ] = useState(undefined);

    useEffect(() => {
        if(question){

            var answerData = {
                type: question.type,
            };

            switch(question.type){
                case 'trueFalse':
                    answerData.isTrue = question.studentAnswer ? question.studentAnswer.trueFalse.isTrue : undefined;
                    break;
                case 'multipleChoice':
                    let allOptions = question.multipleChoice.options;
                    let studentOptions = question.studentAnswer ? question.studentAnswer.multipleChoice.options : [];
                    answerData.options = allOptions.map(option => {
                        return {
                            ...option,
                            isCorrect: studentOptions && studentOptions.some(studentOption => studentOption.id === option.id)
                        }
                    });
                    break;
                case 'essay':
                    answerData.content = question.studentAnswer && question.studentAnswer.essay ? question.studentAnswer.essay.content : "";
                    break;
            }
            setAnswer(answerData);
        }
    }, [question]);

    return (
        <Paper variant='outlined' sx={{ p:2 }}>
            {
                answer && (
                    answer.type === 'trueFalse' && (
                        <TrueFalse 
                            allowUndefined={true}
                            isTrue={answer.isTrue} 
                            onChange={onAnswer} 
                        />
                    )
                    ||
                    answer.type === 'multipleChoice' && answer.options && (
                        <MultipleChoice
                            selectOnly
                            options={answer.options}
                            onChange={onAnswer}
                        />
                    )
                    || 
                    answer.type === 'essay' && (
                        <Essay
                            content={answer.content}
                            onChange={onAnswer}
                        />
                    )
                )
                
            }
        </Paper>
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