import { useEffect, useState, useCallback  } from 'react';
import { TextField, Stack, Button } from "@mui/material";
import { Stepper, Step, StepLabel, StepContent } from "@mui/material";

import Question from '../../components/Question';
import { useInput } from '../../utils/useInput';

const defaultQuestion = {
    'type'      : 'MULTIPLE_CHOICE',
    'status'    : 'initial',
    'notified'  : true,
    'points'    : 4,
    'content'   : '',
    'typeSpecific': { }
}

const NewExam = () => {
    const [ activeStep, setActiveStep ] = useState(0);
    
    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription } = useInput('');
    const { value:numberOfQuestions, bind:bindNumberOfQuestions, setError:setErrorNumberOfQuestions } = useInput(0);
    const [ questions, setQuestions ] = useState([]);

    useEffect(() => {
        if(numberOfQuestions < questions.length){
            setQuestions(questions.splice(0, numberOfQuestions));
        }else if(numberOfQuestions > questions.length){
            setQuestions([...questions, ...Array.from({ length: numberOfQuestions - questions.length }, (v, k) => ({ ...defaultQuestion, index: k }))]);
        }
    }, [setQuestions, numberOfQuestions, questions]);

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

    const handleSave = async () => {
        await fetch('/api/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                description,
                questions
            })
        });
    };

    const onQuestionChange = useCallback((index, question) => {
        let newQuestions = [...questions];
        newQuestions[index] = question;
        setQuestions(newQuestions);
    }, [setQuestions, questions]);

    const handleQuestionUp = useCallback((index) => {
        if(index === 0) return;
        let newQuestions = [ ...questions ];

        let current = questions[index];
        let previous = questions[index - 1];
        
        current.status = 'initial';
        previous.status = 'initial';

        newQuestions[index] = previous;
        newQuestions[index - 1] = current;
        setQuestions(newQuestions);
    } , [setQuestions, questions]);

    const handleQuestionDown = useCallback((index) => {
        if(index === questions.length - 1) return;
        let newQuestions = [ ...questions ];
        let current = questions[index];
        let next = questions[index + 1];
        current.status = 'initial';
        next.status = 'initial';

        newQuestions[index] = next;
        newQuestions[index + 1] = current;
        setQuestions([...newQuestions]);
    } , [setQuestions, questions]);

    return (
    <Stack sx={{ minWidth:'800px' }} spacing={2}>
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={handleBack} disabled={activeStep === 0}>Back</Button>
            { activeStep <=  2 && <Button onClick={handleNext}>Next</Button> }
            { activeStep === 3 && <Button onClick={handleNext} variant="contained" color="primary">Save</Button> }
        </Stack>
        <Stepper activeStep={activeStep} orientation="vertical">
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
            
            <Step key="write-questions">
                <StepLabel>Write questions</StepLabel>
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
                    <Stack spacing={2} pt={2}>
                    {questions && questions.length > 0 && questions.map((question, index) =>
                    
                        <Question 
                            key={index} 
                            index={index} 
                            question={question} 
                            onChange={onQuestionChange} 
                            clickUp={handleQuestionUp}
                            clickDown={handleQuestionDown}
                        />
                    )}
                    </Stack>
                </StepContent>
            </Step>
        </Stepper>      
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={handleBack} disabled={activeStep === 0}>Back</Button>
            { activeStep <=  1 && <Button onClick={handleNext}>Next</Button> }
            { activeStep === 2 && <Button onClick={handleSave} variant="contained" color="primary">Save</Button> }
        </Stack>
    </Stack>
    )
}




export default NewExam;