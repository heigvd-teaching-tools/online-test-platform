import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from '../../context/SnackbarContext';

import { Card, CardContent, Stack, Typography, MenuItem, TextField, IconButton, CardActions, Button } from "@mui/material";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import Row from '../layout/Row';
import Column from '../layout/Column';
import DropDown from '../input/DropDown';

import Code from './type_specific/Code';
import MultipleChoice from './type_specific/MultipleChoice';
import TrueFalse from './type_specific/TrueFalse';

import CodeTestResult from './type_specific/CodeTestResult';

import { useInput } from '../../utils/useInput';
import { LoadingButton } from '@mui/lab';

import DialogFeedback from '../feedback/DialogFeedback';


const Question = ({ index, question, clickUp, clickDown, onDelete, onSave }) => {
    
    const { show: showSnackbar } = useSnackbar();
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ deleteRunning, setDeleteRunning ] = useState(false);
    const [ saveRunning, setSaveRunning ] = useState(false);

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

    const deleteQuestion = useCallback(async () => {
        setDeleteRunning(true);
        await fetch(`/api/questions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                question
            })
        })
        .then((res) => res.json())
        .then(() => {
            showSnackbar('Question delete successful');
            onDelete();
        }).catch(() => {
            showSnackbar('Error deleting question', 'error');
        });
        setDeleteRunning(false);
    } , [setDeleteRunning, showSnackbar, question, onDelete]);

    const saveQuestion = useCallback(async () => {
        setSaveRunning(true);
        await fetch(`/api/questions`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                question
            })
        })
        .then((res) => res.json())
        .then((newQuestion) => {
            showSnackbar('Question save successful');
            onSave(newQuestion);
        }).catch(() => {
            showSnackbar('Error saving question', 'error');
        });
        setSaveRunning(false);
    } , [setSaveRunning, showSnackbar, question, onSave]);

    return (
        <>
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
                        ( questionType === 'code' && question.code &&
                            <Stack spacing={2}>
                                <Code 
                                   code={question.code}
                                /> 
                                <CodeTestResult 
                                    code={question.code} 
                                    questionId={question.id} 
                                    beforeTestRun={saveQuestion} 
                                />
                            </Stack>
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
            <CardActions>
                <Row>
                    <Column flexGrow={1}>
                        <LoadingButton 
                            loading={saveRunning}
                            disabled={deleteRunning}
                            variant="contained"
                            color="secondary"
                            startIcon={<SaveIcon />}
                            onClick={saveQuestion}
                        >
                            Save
                        </LoadingButton>
                    </Column>
                    <Column>
                        <LoadingButton 
                            loading={deleteRunning}
                            disabled={saveRunning}
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete
                        </LoadingButton>
                    </Column>
                </Row>
            </CardActions>
        </Card>
        <DialogFeedback 
            open={deleteDialogOpen}  
            title="Delete Question"
            content="Are you sure you want to delete this question?"
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={deleteQuestion}
        />
        </>
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