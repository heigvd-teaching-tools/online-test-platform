import {useState, useCallback, useEffect} from 'react';
import Image from 'next/image';
import ContentEditor from '../input/ContentEditor';
import {Stack, Chip, Typography, MenuItem, TextField, IconButton, Button, Box} from '@mui/material';
import Column from '../layout/utils/Column';
import Row from "../layout/utils/Row";
import DropDown from "../input/DropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {useSnackbar} from "../../context/SnackbarContext";
import {useDebouncedCallback} from "use-debounce";
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

const QuestionUpdate = ({ index, question, onQuestionChange, onQuestionTypeChange, clickUp, clickDown }) => {

    const { show: showSnackbar } = useSnackbar();
    const [ points, setPoints ] = useState(question.points);

    useEffect(() => {
        console.log("Component mounted")
        return () => {
            console.log("Component unmounted")
        }
    }, []);

    const deleteQuestion = useCallback(async () => {
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
                mutate(questions.filter((q) => q.id !== question.id).map((q) => {
                    if(q.order > question.order){
                        q.order--;
                    }
                    return q;
                }));
                showSnackbar('Question delete successful');
            }).catch(() => {
                showSnackbar('Error deleting questions', 'error');
            });
    } , [showSnackbar, question]);

    return (

        <LayoutSplitScreen
            subheader={
                <Stack direction="row" justifyContent="space-between" sx={{ width:'100%'}}>
                    <Button startIcon={<Image alt="Delete" src="/svg/icons/delete.svg" layout="fixed" width="18" height="18" />} onClick={deleteQuestion}>Delete this question</Button>
                </Stack>
            }
            leftPanel={
                question && (
                    <Stack spacing={2} sx={{ overflow:'auto', pl:2, pt:2, pr:1, pb:1, maxHeight:'100%' }}>
                        <Row>
                            <Column width="32px">
                                <Image alt="Loading..." src={`/svg/questions/${question.type}.svg`} layout="responsive" width="32px" height="32px" priority="1" />
                            </Column>
                            <Column flexGrow={1}>
                                <Typography variant="h6">Q{index}</Typography>
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
                                    label="Points"
                                    type="number"
                                    variant="filled"
                                    value={points}
                                    onChange={(e) => {
                                        setPoints(e.target.value);
                                        onQuestionChange("points", e.target.value);
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
                                    id={`question-${index}`}
                                    language="markdown"
                                    rawContent={question.content}
                                    onChange={(content) => onQuestionChange("content", content)}
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
                        onQuestionChange={onQuestionChange}
                    />
                )
            }
        />
    )
}

export default QuestionUpdate;
