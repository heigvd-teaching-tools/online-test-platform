import {useState, useCallback } from 'react';
import Image from 'next/image';
import ContentEditor from '../input/ContentEditor';
import {Stack, Typography, MenuItem, TextField, IconButton, Button} from '@mui/material';
import Column from '../layout/utils/Column';
import Row from "../layout/utils/Row";
import DropDown from "../input/DropDown";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import QuestionTypeSpecific from "./QuestionTypeSpecific";

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
    },
    {
        value: 'web',
        label: 'Web'
    }
];

const QuestionUpdate = ({ question, onQuestionDelete, onQuestionChange, onClickLeft, onClickRight }) => {

    const [ points, setPoints ] = useState(question.points);

    const onQuestionTypeChange = useCallback(async (newQuestionType) => {
        // changing the question type means we need to delete the old type and add the new type
        // the change is done by reference
        delete question[question.type];
        if(!question[newQuestionType]){
            question[newQuestionType] = newQuestionType === 'multipleChoice' ? { options: [
                    { text: 'Option 1', isCorrect: false },
                    { text: 'Option 2', isCorrect: true },
                ]} : {};
        }
        await onQuestionChange(question.id, "type", newQuestionType); // type change is done by reference, so we just need to trigger a state change
    }, [question]);

    const onChange = useCallback((which, newData) => {
        onQuestionChange(question.id, which, newData);
    }, [question]);

    return (
        <LayoutSplitScreen
            subheader={
                <Stack direction="row" justifyContent="space-between" sx={{ width:'100%'}}>
                    <Button startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />} onClick={() => onQuestionDelete(question.id)}>Delete this question</Button>
                </Stack>
            }
            leftPanel={
                question && (
                    <Stack spacing={2} sx={{ overflow:'hidden', pl:1, height:'100%' }}>
                        <Row>
                            <Column width="32px">
                                <Image alt="Question Type Icon" src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                            </Column>
                            <Column flexGrow={1}>
                                <Stack direction="row" alignItems="center">
                                    <IconButton size="small" onClick={() => onClickLeft(question.order)}>
                                        <ArrowLeftIcon fontSize="large" />
                                    </IconButton>
                                    <Typography variant="h6">Q{question.order + 1}</Typography>
                                    <IconButton size="small"  onClick={() => onClickRight(question.order)}>
                                        <ArrowRightIcon fontSize="large"  />
                                    </IconButton>
                                </Stack>
                            </Column>
                            <Column>
                                <DropDown id="question" name="Type" defaultValue={question.type} minWidth="160px" onChange={onQuestionTypeChange}>
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
                                    size="small"
                                    label="Points"
                                    type="number"
                                    variant="filled"
                                    value={points}
                                    onChange={(e) => {
                                        setPoints(e.target.value);
                                        onChange("points", e.target.value);
                                    }}
                                />
                            </Column>
                        </Row>
                        <Row>
                            <Column flexGrow={1}>
                                <ContentEditor
                                    id={`question-${question.id}`}
                                    language="markdown"
                                    rawContent={question.content}
                                    onChange={(content) => onChange("content", content)}
                                />
                            </Column>
                        </Row>
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
