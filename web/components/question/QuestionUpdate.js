import { useState, useCallback } from 'react';
import Image from 'next/image';
import {Stack, Typography, MenuItem, TextField, IconButton, Button, Box} from '@mui/material';
import ContentEditor from '../input/ContentEditor';
import DropDown from "../input/DropDown";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QuestionTypeSpecific from "./QuestionTypeSpecific";
import {useDebouncedCallback} from "use-debounce";
import languages from "./type_specific/code/languages.json";

const environments = languages.environments;

const questionTypes = [{
    value: 'multipleChoice',
    label: 'Multiple Choice'
},{
    value: 'trueFalse',
    label: 'True False'
},{
    value: 'essay',
    label: 'Essay'
},{
    value: 'code',
    label: 'Code'
},{
    value: 'web',
    label: 'Web'
}];

const QuestionUpdate = ({ question, onQuestionDelete, onQuestionChange, onClickLeft, onClickRight }) => {

    const [ points, setPoints ] = useState(question.points);

    const onQuestionTypeChange = useCallback(async (newQuestionType) => {
        // changing the question type means we need to delete the old type and add the new type
        // the change is done by reference
        delete question[question.type];
        if(!question[newQuestionType]){
            // when the new type specific is a complex object, we need to generate a default one
            // the default TypeSpecific will be sent to backend to full-fit the relational requirement
            switch(newQuestionType) {
                case 'multipleChoice':
                    question[newQuestionType] = { options: [
                        { text: 'Option 1', isCorrect: false },
                        { text: 'Option 2', isCorrect: true },
                    ]};
                    break;
                case 'code':
                    question[newQuestionType] = {
                        language: environments[0].language,
                        sandbox: {
                            image: environments[0].sandbox.image,
                            beforeAll: environments[0].sandbox.beforeAll,
                        }
                    }
                    break;
                default:
                    question[newQuestionType] = {};
            }
        }

        await onQuestionChange(question.id, {
            type: newQuestionType,
            [newQuestionType]: question[newQuestionType]
        });
    }, [question, onQuestionChange]);

    const onChange = useCallback((changedProperties) => {
        onQuestionChange(question.id, changedProperties);
    }, [question, onQuestionChange]);

    const debounceChange = useDebouncedCallback(useCallback((changedProperties) => {
        onChange(changedProperties);
    }, [onChange]), 500);

    return (
        <LayoutSplitScreen
            leftPanel={
                question && (
                    <Stack spacing={2} sx={{ p:2, pt:3, height:'100%' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width:32, height:32 }}>
                                <Image alt="Question Type Icon" src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                            </Box>

                            <Stack direction="row" alignItems="center" sx={{ flex:1 }}>
                                <IconButton size="small" onClick={() => onClickLeft(question.order)}>
                                    <ArrowLeftIcon fontSize="large" />
                                </IconButton>
                                <Typography variant="h6">Q{question.order + 1}</Typography>
                                <IconButton size="small"  onClick={() => onClickRight(question.order)}>
                                    <ArrowRightIcon fontSize="large"  />
                                </IconButton>
                            </Stack>
                            <Box>
                                <DropDown id="question" name="Type" defaultValue={question.type} minWidth="160px" onChange={onQuestionTypeChange}>
                                    {questionTypes.map(({value, label}) =>
                                        <MenuItem key={value} value={value}>
                                            <Typography variant="caption">{label}</Typography>
                                        </MenuItem>
                                    )}
                                </DropDown>
                            </Box>
                            <TextField
                                sx={{width:60}}
                                id="outlined-points"
                                size="small"
                                label="Points"
                                type="number"
                                variant="filled"
                                value={points}
                                onChange={(e) => {
                                    setPoints(e.target.value);
                                    onChange({
                                        points: e.target.value
                                    });
                                }}
                            />
                        </Stack>
                        <Box sx={{ overflow:'auto', width:'100%', height:'100%' }}>
                            <ContentEditor
                                id={`question-${question.id}`}
                                language="markdown"
                                rawContent={question.content}
                                onChange={(content) => debounceChange({
                                    content: content
                                })}
                            />
                        </Box>

                        <Stack direction="row" justifyContent="flex-end" sx={{ width:'100%'}}>
                            <Button startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />} onClick={() => onQuestionDelete(question.id)}>Delete this question</Button>
                        </Stack>
                    </Stack>
                )
            }
            rightPanel={
                question && (
                    <QuestionTypeSpecific
                        question={question}
                        onQuestionChange={onChange}
                    />
                )
            }
        />
    )
}

export default QuestionUpdate;
