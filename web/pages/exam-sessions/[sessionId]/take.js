import LoadingAnimation from "../../../components/layout/LoadingAnimation";
import { useRouter } from "next/router";
import useSWR from "swr";
import AlertFeedback from "../../../components/feedback/Alert";
import { Typography, Stack, Pagination, PaginationItem, StepLabel,   } from "@mui/material";

const TakeExam = () => {
    const { query: { sessionId }} = useRouter();

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${sessionId}`,
        sessionId ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    if (errorSession) return <AlertFeedback type="error" message={errorSession.message} />; 
    if (!examSession) return <LoadingAnimation /> 
    if(examSession && examSession.phase !== 'IN_PROGRESS') return <LoadingAnimation text={`${examSession.label} is not in progress.`} />;
    
    return (
        <Stack sx={{ minWidth:'90vw' }} spacing={4} pb={40}>
            <Pagination 
                showFirstButton 
                showLastButton 
                siblingCount={15} 
                count={examSession.questions.length} 
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
                />
            
            <Stack spacing={4}>
                {examSession.questions.map((question, index) => (
                    <Stack key={question.id} spacing={4}>
                        <Typography variant="h6">{question.label}</Typography>
                        <Typography variant="body1">{question.description}</Typography>
                        </Stack>
                ))}
            </Stack>
        </Stack> 
    )
}

export default TakeExam;