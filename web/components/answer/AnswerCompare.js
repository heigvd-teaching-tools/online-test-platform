import { useState, useEffect, useRef, useCallback } from 'react';

import { Grid, Paper, Stack, ToggleButton, Typography } from "@mui/material";

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';
import { Box } from '@mui/system';

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
        <Paper ref={container} square elevation={0} sx={{ flex:1, height:'100%', overflow:'hidden', pt:2, pl:2, pb:1 }}>
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
                    <Essay
                        id={`answer-editor-${question.id}`}	
                        label="Your answer"
                        content={answer[question.type].content}
                    />
                )
                ||
                question.type === 'code' && (
                    <Code
                        id={`answer-editor-${question.id}`}	
                        where="answer"
                        mode="partial"
                        code={answer[question.type].code}
                        containerHeight={height}
                        
                    />      
                )       

            )
        }
        </Paper>
    )
}


import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

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
        <Stack direction="row" spacing={2} alignItems="center">
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
        <Grid container display="grid" columnGap={4} rowSpacing={2} gridTemplateColumns={"repeat(2, 1fr)"}>
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

export default AnswerCompare;