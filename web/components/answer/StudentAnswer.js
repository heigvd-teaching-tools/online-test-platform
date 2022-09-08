import Image from 'next/image'
import { Box, Paper, Typography, Chip, Stack, Button } from "@mui/material";
import Row from '../layout/Row';
import Column from '../layout/Column';
import AnswerEditor from "./AnswerEditor";
import CodeTestResult from '../question/type_specific/CodeTestResult';
import { Editor, EditorState, convertFromRaw } from "draft-js"
import ResizePanel from '../layout/ResizePanel';

const StudentAnswer = ({ question, page, totalPages, setPage, onAnswer }) => {
    const contentState = convertFromRaw(JSON.parse(question.content));
    const editorState = EditorState.createWithContent(contentState);
    return (
        <>
        <ResizePanel 
            leftPanel={
                <Box sx={{ overflow:'auto', minWidth: 0, m:1 }}>
                    <Row>
                        <Column flexGrow={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Button color="primary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                                    <Typography variant="body1"><b>{page}</b> / {totalPages}</Typography>
                                    <Button color="primary" onClick={() => setPage(page + 1)}>Next</Button>
                            </Stack>
                        </Column>
                    </Row>
                    <Row>
                        <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                        <Column right><Typography variant="body1">{displayQuestionType(question.type)}</Typography></Column>
                        <Column flexGrow={1} right><Chip color="info" label={`${question.points} pts`} /></Column>
                    </Row>
                    <Row>
                        <Column flexGrow={1}>
                            <Editor 
                                readOnly={true} 
                                editorState={editorState} 
                            />
                        </Column>
                    </Row>
                </Box>
            }
            rightPanel={
                <Box sx={{ width:'100%', height:'100%', pt:1 }}>
                    <AnswerEditor 
                        question={question}
                        onAnswer={onAnswer} 
                    />          
                </Box>  
            }
        />
        { question.type === 'code' && (
            <Paper square sx={{ p:1, mt:1 }}>
                <CodeTestResult 
                    code={question.studentAnswer ? question.studentAnswer.code : question.code}
                    questionId={question.id}
                />
            </Paper>
        ) }
        
        </>
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
            return "Code Challenge";
        default:
            return "N/A";
    }
}

export default StudentAnswer;