import { useState, useEffect } from 'react';

import { Card, CardContent, Stack, Typography, MenuItem, TextField, IconButton } from "@mui/material";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Row from './layout/Row';
import Column from './layout/Column';
import CodeEditor from './CodeEditor';
import MultipleChoice from './MultipleChoice';
import DropDown from './input/DropDown';

import { useInput } from '../utils/useInput';

const Question = ({ index, question, onChange, clickUp, clickDown }) => {
    
    const [ dataChanged, setDataChanged ] = useState(false);

    const { value:points, setValue:setPoints, bind:bindPoints } = useInput(question.points);
    const { value:content, setValue:setContent, bind:bindContent } = useInput(question.content);

    const [ questionType, setQuestionType ] = useState(question.type);
    const [ typeSpecific, setTypeSpecific ] = useState();

    useEffect(() => {
        if(questionType){
            let newTypeSpecific = question[questionType] || question.typeSpecific;
            
          //  setTypeSpecific(question[questionType] || question.typeSpecific);
        }
    }, [questionType, setTypeSpecific, question]);

    useEffect(() => {
        setPoints(question.points);
        setContent(question.content);
        setQuestionType(question.type);
        //console.log("newTypeSpecific", question.type, question);
        setTypeSpecific(question[question.type] || question.typeSpecific[question.type]);
    }, [question, setPoints, setContent, setQuestionType, setTypeSpecific]);
    
    useEffect(() => setDataChanged(true), [ points, content, questionType, typeSpecific, setDataChanged ]);

    useEffect(() => {
        if(dataChanged){
            let newQuestion = { ...question, content, points, type: questionType };
            if(question.type === questionType){
                newQuestion.typeSpecific = { ...question.typeSpecific, [questionType]: typeSpecific };
            }
            onChange(index, newQuestion);
            console.log("newQuestion", newQuestion);
            setDataChanged(false);
        }
    }, [dataChanged, setDataChanged, onChange, index, question, content, points, questionType, typeSpecific]);

    const handleQuestionTypeChange = (newQuestionType) => {
        setQuestionType(newQuestionType);
    }
    
    const onTypeSpecificChange = (content) => {
        setTypeSpecific(content);
    }

    return (

        <Card variant="outlined" sx={{ flexGrow: 1, ':hover': { boxShadow: 5 } }}>
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
                    <Column flexGrow={1}>
                    {(
                        ( questionType === 'multipleChoice' && <MultipleChoice onChange={onTypeSpecificChange} content={question.typeSpecific.multipleChoice} />) 
                        ||
                        ( questionType === 'code' && <CodeEditor content={question.typeSpecific.code} onChange={onTypeSpecificChange} /> )
                    )}
                    </Column>
                </Row>
            </CardContent>
        </Card>
    )
}




const questionTypes = [
    {
        value: 'multipleChoice',
        label: 'Multiple Choice'
    },
    {
        value: 'trueFalse',
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