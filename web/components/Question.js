import { useState, useEffect } from 'react';

import { Card, CardContent, CardActions, Typography, MenuItem, TextField, Button } from "@mui/material";

import Row from './layout/Row';
import Column from './layout/Column';
import CodeEditor from './CodeEditor';
import DropDown from './input/DropDown';

import { useInput } from '../utils/useInput';

const Question = ({ index, question, onChange }) => {
    
    const [ dataChanged, setDataChanged ] = useState(false);

    const { value:points, setValue:setPoints, bind:bindPoints } = useInput(0);
    const { value:content, setValue:setContent, bind:bindContent } = useInput('');

    const [ questionType, setQuestionType ] = useState('multiple-choice');
    const [ typeSpecific, setTypeSpecific ] = useState({});

    useEffect(() => {
        if(question.status === 'initial'){
            setPoints(question.points);
            setContent(question.content);
            setQuestionType(question.type);
            setTypeSpecific(question.typeSpecific);
            onChange(index, { ...question, status: 'changed' });
        }
    } , [question, setPoints, setContent, setQuestionType, setTypeSpecific, onChange, index]);

    useEffect(() => setDataChanged(true), [ points, content, questionType, typeSpecific, setDataChanged]);

    useEffect(() => {
        if(dataChanged){
            onChange(index, { ...question, content, points, type: questionType, "type-specific": typeSpecific});
            setDataChanged(false);
        }
    }, [dataChanged, setDataChanged, onChange, index, question, content, points, questionType, typeSpecific]);

   
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