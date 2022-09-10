import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from '../../context/SnackbarContext';

import { Card, CardContent, Stack, Typography, MenuItem, TextField, IconButton, CardActions, Box, CircularProgress, Alert, AlertTitle } from "@mui/material";

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

import { LoadingButton } from '@mui/lab';

import DialogFeedback from '../feedback/DialogFeedback';
import ContentEditor from '../input/ContentEditor';

import { useDebouncedCallback } from 'use-debounce';

const Question = ({ index, question, clickUp, clickDown, onChange, onDelete }) => {
    
    const { show: showSnackbar } = useSnackbar();
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ deleteRunning, setDeleteRunning ] = useState(false);
    const [ saveRunning, setSaveRunning ] = useState(false);

    const [ points, setPoints ] = useState(question.points);
        
    const [ questionType, setQuestionType ] = useState(question.type);

    useEffect(() => {
        setPoints(question.points);
        setQuestionType(question.type);
    }, [setPoints, setQuestionType, question]);


    const handleQuestionTypeChange = (newQuestionType) => {
        if(!question[newQuestionType]){
            question[newQuestionType] = newQuestionType === 'multipleChoice' ? { options: [
                { text: 'Option 1', isCorrect: false },
                { text: 'Option 2', isCorrect: true },
            ] } : {};
        }
        setQuestionType(newQuestionType);
        onQuestionChange({ type: newQuestionType, [newQuestionType]: question[newQuestionType] });
    }

    const onContentChange = useCallback((content) => {
        onQuestionChange({ content });
    }, [onQuestionChange]);

    const onQuestionChange = useCallback(async (anything) => {
        let newQuestion = { 
            ...question, 
            ...anything 
        };
        
        await saveQuestion(newQuestion);
        onChange(index, newQuestion);
    }, [onChange, index, question, saveQuestion]);

    const saveQuestion = useDebouncedCallback(useCallback(async (question) => {       
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
        .then((_) => {
            setSaveRunning(false);
        }).catch(() => {
            setSaveRunning(false);
            showSnackbar('Error saving question', 'error');
        });
    } , [showSnackbar]), 1000);

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
                            onChange={(e) => { 
                                setPoints(e.target.value);
                                onQuestionChange({points: e.target.value});
                            }}
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
                        <ContentEditor
                            content={question.content}
                            onChange={onContentChange}
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
                                    onQuestionChange({ multipleChoice: { options: newOptions } });
                                }}
                            />
                        ) 
                        ||
                        ( questionType === 'code' && question.code &&
                            <Stack spacing={2}>
                                <Code 
                                    editorHeight='450px'
                                    rightEditorLabel={{
                                        label: "Partial Code",
                                        subheader: "Provided to students" 
                                    }}
                                    code={question.code}
                                    onChange={(which, newCode) => {
                                        onQuestionChange({ code: { [which]: newCode } });
                                    }}
                                /> 
                                <CodeTestResult 
                                    code={question.code} 
                                    questionId={question.id} 
                                />
                            </Stack>
                        )
                        ||
                        ( questionType === 'trueFalse' && question.trueFalse &&
                            <TrueFalse 
                                isTrue={question.trueFalse.isTrue}
                                onChange={(newIsTrue) => {
                                    onQuestionChange({ trueFalse: { isTrue: newIsTrue } });
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
                        <SavingIndicator isSaving={saveRunning} />
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

const SavingIndicator = ({isSaving}) =>
<Stack sx={{ visibility: isSaving ? 'visible': 'hidden' }} direction="row" spacing={1} alignItems="center" >
    <CircularProgress
        size={24}
        color="info"
    />
    <Typography variant="caption">Save in progress...</Typography>
</Stack>        

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