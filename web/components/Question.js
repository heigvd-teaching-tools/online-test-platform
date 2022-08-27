import { useState, useEffect } from 'react';

import { Card, CardContent, Stack, Typography, MenuItem, TextField, IconButton } from "@mui/material";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Row from './layout/Row';
import Column from './layout/Column';
import CodeEditor from './CodeEditor';
import DropDown from './input/DropDown';

import { useInput } from '../utils/useInput';

const Question = ({ index, question, onChange, clickUp, clickDown }) => {
    
    const [ dataChanged, setDataChanged ] = useState(false);

    const { value:points, setValue:setPoints, bind:bindPoints } = useInput(0);
    const { value:content, setValue:setContent, bind:bindContent } = useInput('');

    const [ questionType, setQuestionType ] = useState('');
    const [ typeSpecific, setTypeSpecific ] = useState();

    useEffect(() => {
        if(question.status === 'initial'){
            console.log("Question", index, question);
            setPoints(question.points);
            setContent(question.content);
            setQuestionType(question.type);
            setTypeSpecific(question.questionCode || {}); // TODO do whats necessary
            onChange(index, { ...question, status: 'changed' });
        }
    } , [question, setPoints, setContent, setQuestionType, setTypeSpecific, onChange, index]);

    useEffect(() => {
        console.log("Question Type", index, questionType);
    }, [index, questionType]);

    useEffect(() => {
        console.log("Question typeSpecific", index, typeSpecific);
    }, [index, typeSpecific]);

    useEffect(() => setDataChanged(true), [ points, content, questionType, typeSpecific, setDataChanged]);

    useEffect(() => {
        if(dataChanged){
            onChange(index, { ...question, content, points, type: questionType, typeSpecific: typeSpecific});
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
                        <Typography variant="h6">Q{index + 1}</Typography>
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
                    <Column>
                        <Stack>
                            
                            <IconButton size="small" onClick={() => clickUp(index)}>
                                <ArrowDropUpIcon />
                            </IconButton>
                            
                            
                            <IconButton size="small" onClick={() => clickDown(index)}>
                                <ArrowDropDownIcon />
                            </IconButton>
                        </Stack>
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
                    { typeSpecific && questionType.length > 0 && (
                        ( questionType === 'MULTIPLE_CHOICE' && <Typography >Multiple Choice</Typography> )
                        ||
                        ( questionType === 'CODE' && <CodeEditor value={typeSpecific.code} onChange={(code) => onTypeSpecificChange(code)} /> )
                    )}
                    
                </Row>
            </CardContent>
        </Card>
    )
}




const questionTypes = [
    {
        value: 'MULTIPLE_CHOICE',
        label: 'Multiple Choice'
    },
    {
        value: 'TRUE_FALSE',
        label: 'True False'
    },
    {
        value: 'ESSAY',
        label: 'Essay'
    },
    {
        value: 'CODE',
        label: 'Code'
    }
];

export default Question;