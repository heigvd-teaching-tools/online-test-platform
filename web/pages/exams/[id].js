import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField } from "@mui/material";
import { useInput } from '../../utils/useInput';
import Question from '../../components/Question';

import LoadingAnimation from '../../components/layout/LoadingAnimation';

const UpdateExam = () => {
    const { query: { id }} = useRouter();

    const [ activeStep, setActiveStep ] = useState(1);

    const { data: exam, error } = useSWR(
        `/api/exams/${id}`,
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription, setValue:setDescription } = useInput('');
    const { value:numberOfQuestions, bind:bindNumberOfQuestions, setValue:setNumberOfQuestions, setError:setErrorNumberOfQuestions } = useInput(0);
    const [ questions, setQuestions ] = useState([]);
    
    useEffect(() => {
        if(exam) {
            setLabel(exam.label);
            setDescription(exam.description);
            setNumberOfQuestions(exam.questions.length);
            setQuestions(exam.questions.map((question) => ({
                ...question,
                status:'initial'
            })));
        }
    }, [exam, setLabel, setDescription, setNumberOfQuestions, setQuestions]);

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

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    }

    const handleNext = () => {
        if(inputControl(activeStep)){
            setActiveStep(activeStep + 1);
        }
    }

    const handleSave = async () => {
        await fetch(`/api/exams/${id}`, {
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

    
    if (error) return <div>failed to load</div>
    if (!exam) return <LoadingAnimation /> 

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


const defaultQuestion = {
    'type'      : 'MULTIPLE_CHOICE',
    'status'    : 'initial',
    'points'    : 4,
    'content'   : '',
    'questionMultipleChoice': { }
}


export default UpdateExam;