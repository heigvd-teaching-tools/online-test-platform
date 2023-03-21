import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Stack, Typography, MenuItem, TextField, IconButton, Button, Box } from '@mui/material';
import ContentEditor from '../input/ContentEditor';
import DropDown from "../input/DropDown";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QuestionTypeSpecific from "./QuestionTypeSpecific";
import { useDebouncedCallback } from "use-debounce";

import types from "./types.json";

const QuestionUpdate = ({ question, onQuestionDelete, onQuestionChange, onClickLeft, onClickRight }) => {

    const [ points, setPoints ] = useState(question.points);

    const onQuestionTypeChange = useCallback(async (newQuestionType) => {
        // changing the question type means we need to delete the old type and add the new type
        // the change is done by reference
        delete question[question.type];
        question[newQuestionType] = {};

        await onQuestionChange(question.id, {
            type: newQuestionType,
            [newQuestionType]: question[newQuestionType]
        });
    }, [question, onQuestionChange]);

    const onChange = useCallback((changedProperties) => {
        /*
            this event is only used for simple question types with single level models (trueFalse, Essay, Web)
            the more complex question models with nesting (multipleChoice, code) are managed in their own components and does not
            call this callback.
        */
        onQuestionChange(question.id, changedProperties);
    }, [question, onQuestionChange]);

    const debounceChange = useDebouncedCallback(useCallback((changedProperties) => {
        onChange(changedProperties);
    }, [onChange]), 500);

    return (
        <LayoutSplitScreen
            leftPanel={
                question && (
                    <Stack spacing={2} sx={{ pl:2, pt:3, pb:2, height:'100%' }}>
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
                                    {types?.map(({value, label}) =>
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
