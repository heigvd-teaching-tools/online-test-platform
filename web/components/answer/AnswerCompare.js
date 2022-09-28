import { useState, useEffect, useRef } from 'react';

import { Box, Accordion, AccordionDetails, AccordionSummary, Grid, Paper, Stack, Typography } from "@mui/material";

const AnswerCompare = ({ question, answer }) => {
    const container = useRef();
    const [ height, setHeight ] = useState(0);

    const resizeObserver = useRef(new ResizeObserver(entries => {
        const { height } = entries[0].contentRect;
        setHeight(height);
    }));
   
    useEffect(() => {
            var element = container.current;
            var observer = resizeObserver.current;
            observer.observe(element);         

            // Remove event listener on cleanup
            return () => observer.unobserve(element);
      }, [resizeObserver, container]);

    return (
        <Paper ref={container} square elevation={0} sx={{ flex:1, height:'100%', overflowX:'auto', p:0 }}>
        {
            answer && (
                question.type === 'trueFalse' && (
                    <CompareTrueFalse 
                        id={`answer-comparator-${question.id}`}	
                        solution={question[question.type].isTrue}
                        answer={answer[question.type].isTrue}
                    />
                )
                ||
                question.type === 'multipleChoice' && answer[question.type].options && (
                    <CompareMultipleChoice
                        id={`answer-editor-${question.id}`}	
                        solution={question[question.type].options}
                        answer={answer[question.type].options}
                    />
                )
                || 
                question.type === 'essay' && (
                    <CompareEssay
                        id={`answer-editor-${question.id}`}	
                        answer={answer[question.type]}
                    />
                )
                ||
                question.type === 'code' && (
                    <CompareCode
                        id={`answer-editor-${question.id}`}	
                        height={height-60}
                        solution={question[question.type]}
                        answer={answer[question.type]}
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

const RadioViewer = ({ selected, filled }) => {
    return (
        <Stack alignItems="center" justifyContent="center" sx={{ border: '1px solid', borderColor: selected ? 'success.main' : 'grey.400', borderRadius: 2, p:1}}>
            <Box sx={{ width:24, height:24 }}>
                { filled && selected && (<CheckIcon sx={{ color: 'success.main', width:24, height:24 }} /> )}
                { filled && !selected && (<ClearIcon sx={{ color: 'error.main', width:24, height:24 }} /> )}
            </Box>
        </Stack>
    )
}

const CompareTrueFalse = ({ solution, answer }) => {
    return (
        <Stack direction="row" spacing={2} sx={{p:2}} alignItems="center">
            <RadioViewer selected={solution} filled={answer} />
            <Box>
                <Typography variant="body1">True</Typography>
            </Box>
            <RadioViewer selected={!solution} filled={!answer} />
            <Box>
                <Typography variant="body1">False</Typography>
            </Box>
        </Stack>
    )
}

const CompareMultipleChoice = ({ solution, answer }) => {
    return (
        <Grid container display="grid" sx={{p:2}} columnGap={4} rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
            { solution.map((option, index) => (
                 <Grid item key={index}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex:1 }}>
                    <RadioViewer key={index} selected={option.isCorrect} filled={answer.some((opt) => opt.id === option.id)} />
                    <Box>
                        <Typography variant="body1">{option.text}</Typography>
                    </Box>
                    </Stack>
                </Grid>
            ))
            }
        </Grid>
    )
}

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentEditor from '../input/ContentEditor';

const CompareCode = ({ solution, answer, height }) => {

    const [expanded, setExpanded] = useState(true);

    const handleChange = () => {
        setExpanded(!expanded);      
    };

    return (
        <>
        <Accordion  
            sx={{
                border: 'none',
                '&.MuiPaper-root': {
                    boxShadow: 'none',
                }
            }}
            disableGutters square expanded={expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">Student Answer / Solution</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                rightWidth={20}
                height={height-66}
            />
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

export default AnswerCompare;