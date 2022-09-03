import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Card, CardContent, Stack, Typography, MenuItem, TextField, IconButton } from "@mui/material";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Row from '../layout/Row';
import Column from '../layout/Column';
import DropDown from '../input/DropDown';

import Code from './type_specific/Code';
import MultipleChoice from './type_specific/MultipleChoice';
import TrueFalse from './type_specific/TrueFalse';

import { useInput } from '../../utils/useInput';


const Question = ({ index, question, clickUp, clickDown }) => {

    const { value:points, setValue:setPoints, bind:bindPoints } = useInput(question.points);
    const { value:content, setValue:setContent, bind:bindContent } = useInput(question.content);

    const [ questionType, setQuestionType ] = useState(question.type);

    useEffect(() => {
        setPoints(question.points);
        setContent(question.content);
        setQuestionType(question.type);
        
    }, [setPoints, setContent, setQuestionType, question]);
    
    useEffect(() => {
        question.points = points;
        question.content = content;
        question.type = questionType;    
    }, [question, content, points, questionType]);

    const handleQuestionTypeChange = (newQuestionType) => {
        if(!question[newQuestionType]){
            question[newQuestionType] = {};
        }
        setQuestionType(newQuestionType);
    }

    return (
        <Card variant="outlined" sx={{ flexGrow: 1, ':hover': { boxShadow: 5 } }}>
            <CardContent>
                <Row>
                    <Column width="32px">
                        <Image alt="Loading..." src={`/svg/questions/${questionType}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                    </Column>
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
                        ( questionType === 'multipleChoice' && question.multipleChoice &&
                            <MultipleChoice 
                                options={question.multipleChoice.options}
                                onChange={(newOptions) => {
                                    question.multipleChoice.options = newOptions;
                                }}
                            />
                        ) 
                        ||
                        ( questionType === 'code' && 
                            <Code 
                                questionId={question.id}
                                code={question.code}
                            /> 
                        )
                        ||
                        ( questionType === 'trueFalse' && question.trueFalse &&
                            <TrueFalse 
                                isTrue={question.trueFalse.isTrue}
                                onChange={(newIsTrue) => {
                                    question.trueFalse.isTrue = newIsTrue;
                                }}
                            /> 
                        )
                        
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