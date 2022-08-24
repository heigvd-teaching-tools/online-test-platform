import { useState } from 'react';
import { TextField, Stack, Typography, Button } from "@mui/material";
import { Stepper, Step, StepLabel, StepContent } from "@mui/material";
import { Card, CardContent, CardActionArea, CardActions } from "@mui/material";
import { Select, InputLabel, FilledInput, MenuItem, FormControl } from "@mui/material";
import Row from '../../components/layout/Row';
import Column from '../../components/layout/Column';
import { useInput } from '../../utils/useInput';

import Editor from "@monaco-editor/react";

const questionTypes = [
    {
        value: 'multiple-choice',
        label: 'Multiple Choice'
    },
    {
        value: 'true-false',
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

]

const DropDown = ({children, id, name, defaultValue, minWidth = '120px', size = 1, onChange}) => {
    const [value, setValue] = useState(defaultValue || '');
    const handleChange = (event) => {
        setValue(event.target.value);
        onChange(event.target.value);
    }
    return (
        <FormControl sx={{ flexGrow:1, minWidth }} variant="filled" margin="none">
            <InputLabel id={`label-${id}`}>
                <Typography variant="body1">{name}</Typography>
            </InputLabel>
            <Select
                labelId={`label-${id}`}
                id={id}
                autoWidth
                onChange={handleChange}
                value={value}
                MenuProps={{ variant: 'selectedMenu'}}
                sx={{padding:0}} 
            >
                {children}
            </Select>
        </FormControl>
    )
}

const Question = () => {
    const handleQuestionTypeChange = (value) => {
        console.log("handleQuestionTypeChange", value);
    }
    const { value:points, bind:bindPoints } = useInput(4);
    const { value:question, bind:bindQuestion } = useInput('');
    return (
        <Card variant="outlined" sx={{ flexGrow: 1 }}>
            <CardContent>
                <Row>
                    <Column>
                        <DropDown id="question" name="Question Type" defaultValue="code" minWidth="160px" onChange={handleQuestionTypeChange}>
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
                </Row>
                <Row>
                    <Column flexGrow={1}>
                        <TextField
                            label="Question"
                            id="question-content"
                            fullWidth
                            multiline
                            rows={4}
                            value={question}
                            {...bindQuestion}
                        />
                    </Column>
                </Row>
                <Row>
                <Card variant="outlined" sx={{ flexGrow:1, p:2}}>
                        <Editor
                            height="350px"
                            defaultLanguage="javascript"
                            theme='vs-dark'
                            defaultValue={`// some comment
    const HelloWorld = () => {
                                
    }                            
    export default HelloWorld;
                            `}
                        />
                        <CardActions>
                            <Button size="small">Run Code</Button>
                        </CardActions>
                </Card>
                </Row>
                <CardActions>
                    <Button size="small" variant="contained">Save</Button>
                </CardActions>
            </CardContent>
        </Card>
    )
}



const NewExam = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription } = useInput('');
    const { value:questions, bind:bindQuestions, setError:setErrorQuestions } = useInput(0);

    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
            case 1:
                if(questions <= 0){
                    setErrorQuestions({ error: true, helperText: 'You must specify at least one question' });
                }
                return questions > 0;
            default:
                return true;
        }
    }

    const handleNext = () => {
        if(inputControl(activeStep)){
            setActiveStep(activeStep + 1);
        }
    }

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    }

    return (
    <Stack sx={{ minWidth:'800px' }} spacing={6}>
        <Stepper activeStep={activeStep} orientation="vertical">
        <Step key="write-questions2">
                <StepLabel>Write all the questions</StepLabel>
                <StepContent>
                    
                        <Question />
                    
                </StepContent>

            </Step>
            <Step key="general">
                <StepLabel>General informations</StepLabel>
                <StepContent>
                    <Stack spacing={2} pt={2}>
                        <TextField
                            label="Label"
                            id="exam-label"
                            fullWidth
                            value={label}
                            {...bindLabel}
                        />
                        <TextField
                            label="Description"
                            id="exam-desctiption"
                            fullWidth
                            multiline
                            rows={4}
                            value={description}
                            {...bindDescription}
                        />
                    </Stack>
                </StepContent>
            </Step>
            <Step key="number-of-questions">
                <StepLabel>Number of questions</StepLabel>
                <StepContent>
                    <Stack direction="row" spacing={2} pt={2}>
                        <TextField
                            id="outlined-number"
                            label="Number of questions"
                            type="number"
                            fullWidth
                            value={questions}
                            {...bindQuestions}
                        />
                    </Stack>
                </StepContent>
            </Step>
            <Step key="write-questions">
                <StepLabel>Write all the questions</StepLabel>
                <StepContent>
                    <Stack direction="row" spacing={2} pt={2}>
                        <Question />
                    </Stack>
                </StepContent>

            </Step>
        </Stepper>      
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={handleBack} disabled={activeStep === 0}>Back</Button>
            { activeStep <=  2 && <Button onClick={handleNext}>Next</Button> }
            { activeStep === 3 && <Button onClick={handleNext} variant="contained" color="primary">Save</Button> }
        </Stack>
    </Stack>
    )
}


export default NewExam;