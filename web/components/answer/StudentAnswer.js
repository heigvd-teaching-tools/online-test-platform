import Image from 'next/image'
import { Stack, Paper, Typography, Chip } from "@mui/material";
import Row from '../layout/Row';
import Column from '../layout/Column';
import AnswerEditor from "./AnswerEditor";
import CodeTestResult from '../question/type_specific/CodeTestResult';

const StudentAnswer = ({ question, page, onAnswer }) => {
    return (
        <>
        <Stack spacing={4} direction={question.type === 'code' ? 'row' : 'column' }>
            <Paper sx={{ p:2, flex: 1 }}>
                <Row>
                    <Column width="32px"><Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" /></Column>
                    <Column><Typography variant="h5">Q{page}</Typography></Column>
                    <Column right><Typography variant="body1">{displayQuestionType(question.type)}</Typography></Column>
                    <Column flexGrow={1} right><Chip color="info" label={`${question.points} pts`} /></Column>
                </Row>
                <Row>
                    <Column><Typography variant="body1">{question.content}</Typography></Column>
                </Row>
            </Paper>
            <Paper variant='outlined' sx={{ p:2, flex: 2 }}>
                <AnswerEditor 
                    question={question}
                    onAnswer={onAnswer} 
                />
            </Paper>
        </Stack>
        { question.type === 'code' && (
            <Paper sx={{ p:2 }}>
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
            return "Code";
        default:
            return "N/A";
    }
}

export default StudentAnswer;