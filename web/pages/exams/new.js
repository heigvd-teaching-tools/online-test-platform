import { useEffect, useState, useCallback  } from 'react';
import { TextField, Stack, Button } from "@mui/material";
import { Stepper, Step, StepLabel, StepContent } from "@mui/material";

import Question from '../../components/Question';
import { useInput } from '../../utils/useInput';

const defaultQuestion = {
    'type'      : 'multiple-choice',
    'status'    : 'initial',
    'notified'  : true,
    'points'    : 4,
    'content'   : '',
    'type-specific': {}
}

const NewExam = () => {
    const [ activeStep, setActiveStep ] = useState(0);
    
    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription } = useInput('');
    const { value:numberOfQuestions, bind:bindNumberOfQuestions, setError:setErrorNumberOfQuestions } = useInput(0);
    const [ questions, setQuestions ] = useState([defaultQuestion]);

    useEffect(() => {
        console.log("questions", questions);
    }, [questions]);

    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
            case 1:
                if(numberOfQuestions <= 0){
                    setErrorNumberOfQuestions({ error: true, helperText: 'You must specify at least one question' });
                }
                return numberOfQuestions > 0;
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

    const onQuestionChange = useCallback((index, question) => {
        if(question.status === 'changed'){
            let newQuestions = [...questions];
            newQuestions[index] = {
                ...question,
                status: 'draft'
            };
            console.log("onQuestionChange", newQuestions);
            setQuestions(newQuestions);
        }
    }, [setQuestions, questions]);

    return (
    <Stack sx={{ minWidth:'800px' }} spacing={6}>
        <Stepper activeStep={activeStep} orientation="vertical">
        <Step key="write-questions2">
                <StepLabel>Write all the questions</StepLabel>
                <StepContent>
                    {questions && questions.length > 0 && questions.map((question, index) =>
                        <Question key={index} index={index} question={question} onChange={onQuestionChange} />
                    )}
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
                            value={numberOfQuestions}
                            {...bindNumberOfQuestions}
                        />
                    </Stack>
                </StepContent>
            </Step>
            <Step key="write-questions">
                <StepLabel>Write all the questions</StepLabel>
                <StepContent>
                    <Stack direction="row" spacing={2} pt={2}>
                        
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