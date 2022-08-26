import { useState, useEffect } from 'react';

import { Card, CardContent, CardActions, Typography, MenuItem, TextField, Button } from "@mui/material";

import Row from './layout/Row';
import Column from './layout/Column';
import CodeEditor from './CodeEditor';
import DropDown from './input/DropDown';

import { useInput } from '../utils/useInput';

const Question = ({ index, question:initial, onChange }) => {

    const [ question, setQuestion ] = useState({ points: 4, content: '', type: 'multiple-choice', typeSpecific: {}, status: 'initial' });
    
    const { value:points, setValue:setPoints, bind:bindPoints } = useInput(question.points);
    const { value:content, setValue:setContent, bind:bindContent } = useInput(question.content);

    const [ questionType, setQuestionType ] = useState(question.type);
    const [ typeSpecific, setTypeSpecific ] = useState({});

    useEffect(() => {
        if(initial && initial.status === 'initial'){
            setQuestion(initial);
            onChange(index, { ...initial, status: 'draft' });
        }
    }, [initial, onChange, index, setQuestion]);

    useEffect(() => {   
        if(question.status !== 'initial'){
            onChange(index, question);
        }
    } , [onChange, index, question]);

    useEffect(() => {
        setQuestion({ 
            points,
            content,
            type: questionType,
            typeSpecific: typeSpecific,
            status: 'draft'

        });
    } , [points, content, questionType, typeSpecific, setQuestion]);

   
    const handleQuestionTypeChange = (questionType) => {
        setQuestionType(questionType);
    }
    
    const onTypeSpecificChange = (code) => {
        setTypeSpecific({
            code
        });
    }

    return (

        <Card variant="outlined" sx={{ flexGrow: 1 }}>
            <CardContent>
                <Row>
                    <Column flexGrow={1}>
                        <Typography variant="h6">Q{index}</Typography>
                    </Column>
                    <Column>
                        <DropDown id="question" name="Type" defaultValue={questionType} minWidth="160px" onChange={handleQuestionTypeChange}>
                            {questionTypes.map(({value, label}) => 
                                <MenuItem key={value} value={value}>
                                    <Typography variant="caption">{label}</Typography>
                                </MenuItem>
                                )}
                        </DropDown>
                    </Column>
                    <Column>
                        <TextField
                            sx={{width:60}}
                            id="outlined-points"
                            label="Points"
                            type="number"
                            variant="filled"
                            value={points}
                            {...bindPoints}
                        />
                    </Column>
                </Row>
                <Row>
                    <Column flexGrow={1}>
                        <TextField
                            label="Question"
                            id="question-content"
                            fullWidth
                            multiline
                            rows={4}
                            value={content}
                            {...bindContent}
                        />
                    </Column>
                </Row>
                <Row>
                    <CodeEditor onChange={(code) => onTypeSpecificChange(code)} />
                </Row>
            </CardContent>
        </Card>
    )
}


const questionTypes = [
    {
        value: 'multiple-choice',
        label: 'Multiple Choice'
    },
    {
        value: 'true-false',
        label: 'True False'
    },
    {
        value: 'essay',
        label: 'Essay'
    },
    {
        value: 'code',
        label: 'Code'
    }
];

export default Question;