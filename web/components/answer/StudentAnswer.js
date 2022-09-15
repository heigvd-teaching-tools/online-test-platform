import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Stack, Button } from "@mui/material";
import Column from '../layout/Column';
import AnswerEditor from "./AnswerEditor";
import CodeTestResult from '../question/type_specific/CodeTestResult';
import { Editor, EditorState, convertFromRaw } from "draft-js"
import ResizePanel from '../layout/ResizePanel';
import { useRouter } from 'next/router';

const StudentAnswer = ({ question, page, totalPages, onAnswer }) => {
    
    const router = useRouter();
    const [ editorState, setEditorState ] = useState(EditorState.createEmpty());
   
    useEffect(() => {
        if (question.content) {
            const contentState = convertFromRaw(JSON.parse(question.content));
            setEditorState(EditorState.createWithContent(contentState));
        }
    }, [question.content]);

    const nextPage = () => {
        if(page < totalPages) {
            router.push(`/exam-sessions/${router.query.sessionId}/take/${page + 1}`);
        }
    }

    const previousPage = () => {
        if(page > 1) {
            router.push(`/exam-sessions/${router.query.sessionId}/take/${page - 1}`);
        }
    }

    return (
        <>
        <ResizePanel 
            leftPanel={
                <Stack spacing={2} sx={{ overflow:'auto', minWidth: 0, height:'100%', pl:2, pt:2, pr:1, pb:1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                        <Column right><Typography variant="body1"><b>Q{page}</b> / {totalPages} </Typography></Column>
                        <Column flexGrow={1} right><Chip color="info" label={`${question.points} pts`} /></Column>
                    </Stack>
                    <Stack flexGrow={1}>
                        <Editor 
                            readOnly={true} 
                            editorState={editorState} 
                        />
                    </Stack>            
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Button color="primary" disabled={page === 1} onClick={previousPage}>Previous</Button>
                            <Typography variant="body1"><b>{page} / {totalPages}</b></Typography>
                            <Button color="primary" disabled={page === totalPages} onClick={nextPage}>Next</Button>
                    </Stack>
                </Stack>
            }
            rightPanel={
                <Stack sx={{ height:'100%', pt:1 }}>
                    <AnswerEditor 
                        question={question}
                        onAnswer={onAnswer} 
                    />    
                    { question.type === 'code' && (
                        <Paper elevation={2} square sx={{ p:1, mt:1 }}>
                            <CodeTestResult 
                                code={question.studentAnswer ? question.studentAnswer.code : question.code}
                                questionId={question.id}
                            />
                        </Paper>
                    ) }      
                </Stack>  
            }
        
        />
        
        
        </>
    )
}

export default StudentAnswer;