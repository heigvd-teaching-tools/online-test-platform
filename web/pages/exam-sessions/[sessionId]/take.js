import { useEffect, useState } from 'react';
import Image from 'next/image';
import LoadingAnimation from "../../../components/layout/LoadingAnimation";
import { useRouter } from "next/router";
import useSWR from "swr";
import AlertFeedback from "../../../components/feedback/Alert";
import { Typography, Stack, Pagination, PaginationItem, Box, Paper  } from "@mui/material";
import Row from '../../../components/layout/Row';
import Column from '../../../components/layout/Column';

const TakeExam = () => {
    const { query: { sessionId }} = useRouter();

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

    useEffect(() => {
        if(sessionQuestions){
            console.log(sessionQuestions);
            setQuestions(sessionQuestions);
        }
    }, [sessionQuestions]);

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== 'IN_PROGRESS') return <LoadingAnimation text={`${examSession.label} is not in progress.`} />;
    
   
       
    return (
        <Stack sx={{ minWidth:'90vw' }} spacing={4} pb={40}>
            { questions && (
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
                    if(item.type === 'page' && item.page === 3) 
                        sx = { 
                            backgroundColor:    (theme) => theme.palette.success.main,
                            color:              (theme) => theme.palette.success.contrastText 
                        };
                    return <PaginationItem {...item} color="secondary" sx={sx} />
                }}
                onChange={(e, page) => setPage(page)}
                />
            
            <Stack spacing={4} direction="column">
                <Paper sx={{ p:2 }}>
                    <Row>
                        <Column width="32px">
                            <Image alt="Loading..." src={`/svg/questions/${questions[page-1].type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                        </Column>
                        <Column>
                            <Typography variant="h5">Q{page}</Typography>
                        </Column>
                        <Column>
                            <Typography variant="body1">{displayQuestionType(questions[page-1].type)}</Typography>
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <Typography variant="body1">{questions[page-1].content}</Typography>
                        </Column>
                    </Row>
                </Paper>
                <Paper sx={{ p:2 }}>

                </Paper>
                </Stack>
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