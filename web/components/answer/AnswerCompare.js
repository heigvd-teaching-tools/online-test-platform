import { useState, useEffect, useRef } from 'react';
import { QuestionType } from '@prisma/client';
import { Box, Accordion, AccordionDetails, AccordionSummary, Paper, Stack, Typography } from "@mui/material";


const AnswerCompare = ({ id, mode = "compare", questionType, solution, answer }) => {
    return (
        <Paper square elevation={0} sx={{ flex:1, height:'100%', overflowX:'auto', p:0 }}>
        {
            answer && (
                questionType === QuestionType.trueFalse && (
                    <CompareTrueFalse
                        id={id}
                        mode={mode}
                        solution={solution.isTrue}
                        answer={answer.isTrue}
                    />
                )
                ||
                questionType === QuestionType.multipleChoice && answer.options && (
                    <CompareMultipleChoice
                        id={id}
                        mode={mode}
                        solution={solution.options}
                        answer={answer.options}
                    />
                )
                ||
                questionType === QuestionType.essay && (
                    <CompareEssay
                        id={id}
                        mode={mode}
                        answer={answer}
                    />
                )
                ||
                questionType === QuestionType.code && (
                    <CompareCode
                        id={id}
                        mode={mode}
                        solution={solution}
                        answer={answer}
                    />
                )
                ||
                questionType === QuestionType.web && (
                    <CompareWeb
                        id={id}
                        mode={mode}
                        solution={solution}
                        answer={answer}
                    />
                )
            )
        }
        </Paper>
    )
}


import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import CodeCheckResult from '../question/type_specific/CodeCheckResult';
import CodeEditor from '../input/CodeEditor';
import ResizePanel from '../layout/utils/ResizePanel';

const RadioViewer = ({ mode, selected, filled }) => {

    const getIndicator = (mode, filled, selected ) => {
        if (mode === "compare") {
            if(filled && selected) return <CheckIcon sx={{ color: `success.main`, width:24, height:24 }} />;
            if(filled && !selected) return <ClearIcon sx={{ color: `error.main`, width:24, height:24 }} />;
        } else {
            return <ClearIcon sx={{ color: `info.main`, width:24, height:24 }} />;
        }
    }

    return (
        <Stack alignItems="center" justifyContent="center" sx={{ border: '1px solid', borderColor: selected ? 'success.main' : 'grey.400', borderRadius: 2, p:1}}>
            <Box sx={{ width:24, height:24 }}>
                { filled && getIndicator(mode, filled, selected) }
            </Box>
        </Stack>
    )
}

const CompareTrueFalse = ({ mode, solution, answer }) => {
    return (
        <Stack direction="row" spacing={2} sx={{ p:2 }} alignItems="center">
            <RadioViewer mode={mode} selected={solution && solution === true} filled={answer} />
            <Box>
                <Typography variant="body1">True</Typography>
            </Box>
            <RadioViewer mode={mode} selected={solution && solution === false} filled={!answer} />
            <Box>
                <Typography variant="body1">False</Typography>
            </Box>
        </Stack>
    )
}

const CompareMultipleChoice = ({ mode, solution, answer }) => {
    return (
        <Stack spacing={2} sx={{p:2}}>
            { solution.map((option, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={2} sx={{ flex:1 }}>
                    <RadioViewer mode={mode} key={index} selected={option.isCorrect} filled={answer.some((opt) => opt.id === option.id)} />
                    <Box>
                        <Typography variant="body1">{option.text}</Typography>
                    </Box>
                </Stack>
            ))}
        </Stack>
    )
}

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentEditor from '../input/ContentEditor';
import Web from "../question/type_specific/Web";
import {useResizeObserver} from "../../context/ResizeObserverContext";

const accordionSummaryHeight = 64;

const CompareCode = ({ mode, solution, answer }) => {

    const [expanded, setExpanded] = useState(true);

    const { height: containerHeight } = useResizeObserver();

    const handleChange = () => {
        setExpanded(!expanded);
    };

    return (
        <>
        <Accordion
            sx={{
                '&.MuiPaper-root': {
                    boxShadow: 'none',
                }
            }}
            disableGutters square expanded={expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">Student Answer / Solution</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <>
                { mode === "compare" && (
                    <ResizePanel
                        leftPanel={
                            <CodeEditor
                                id={`answer-compare-student`}
                                readOnly
                                code={answer.code}
                            />
                        }
                        rightPanel={
                            <CodeEditor
                                id={`answer-compare-solution`}
                                readOnly
                                code={solution.solution}
                            />
                        }
                        rightWidth={solution.solution ? 20 : 0}
                        height={ containerHeight - 2*accordionSummaryHeight }
                    />
                )}
                { mode === "consult" && (
                    <Box sx={{ flex:1, height:containerHeight-2*accordionSummaryHeight }}>
                    <CodeEditor
                        id={`answer-compare-student`}
                        readOnly
                        code={answer.code}
                    />
                    </Box>
                )}
                </>
            </AccordionDetails>
        </Accordion>
        <Accordion
            sx={{
                border: 'none',
                '&.MuiPaper-root': {
                    boxShadow: 'none',
                }
            }}
            disableGutters square expanded={!expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">Check result</Typography>
                {
                    (answer.success && (
                        <Box sx={{ ml:2 }}>
                            <CheckIcon sx={{ color: 'success.main', width:24, height:24 }} />
                        </Box>
                    ))
                    ||
                    (answer.success === false && (
                        <Box sx={{ ml:2 }}>
                            <ClearIcon sx={{ color: 'error.main', width:24, height:24 }} />
                        </Box>
                    ))
                }
            </AccordionSummary>
            <AccordionDetails>
                <CodeCheckResult result={answer} />
            </AccordionDetails>
        </Accordion>
        </>
    )
}

const CompareEssay = ({ answer }) => {
    return (
        <Box sx={{ p:2 }}>
            <ContentEditor
                id={`answer-compare-essay`}
                readOnly
                rawContent={answer.content}
            />
        </Box>
    )
}

const containerPadding = 32; // 2 * 16px
const CompareWeb = ({ answer }) => {
    const { height: containerHeight } = useResizeObserver();
    return (
        <Box sx={{ p:2 }}>
            <Web
                readOnly={true}
                web={answer}
                containerHeight={containerHeight - containerPadding}
            />
        </Box>
    )
}

export default AnswerCompare;
