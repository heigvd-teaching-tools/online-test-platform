import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField } from "@mui/material";
import { useInput } from '../../utils/useInput';
import Question from '../../components/Question';

import LoadingAnimation from '../../components/layout/LoadingAnimation';
import QuestionList from '../../components/QuestionList';

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
            setQuestions(exam.questions);
        }
    }, [exam, setLabel, setDescription, setNumberOfQuestions]);

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

    

    
    if (error) return <div>failed to load</div>
    if (!exam) return <LoadingAnimation /> 

    return (
        <Stack sx={{ minWidth:'800px' }} spacing={2}>
            <StepNav activeStep={activeStep} onBack={handleBack} onNext={handleNext} onSave={handleSave}  />
            
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
                        <Stack spacing={2} pt={2}>
                            <TextField
                                id="outlined-number"
                                label="Number of questions"
                                type="number"
                                fullWidth

                                value={numberOfQuestions}
                                {...bindNumberOfQuestions}
                            />
                        
                            <QuestionList questions={questions} setQuestions={setQuestions} />
                        </Stack>
                    </StepContent>
                </Step>
            </Stepper>      

            <StepNav activeStep={activeStep} onBack={handleBack} onNext={handleNext} onSave={handleSave}  />

        </Stack>

    )
}

const StepNav = ({ activeStep, onBack, onNext, onSave }) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={onBack} disabled={activeStep === 0}>Back</Button>
            { activeStep <=  1 && <Button onClick={onNext}>Next</Button> }
            { activeStep === 2 && <Button onClick={onSave} variant="contained" color="primary">Save</Button> }
        </Stack>
    )
}

const defaultQuestion = {
    'type'      : 'multipleChoice',
    'points'    : 4,
    'content'   : '',
    'typeSpecific': {
        'code'      : '',
        'trueFalse' : {},
        'multipleChoice': {
            'options': []
        },
        'essay': '',
    }
}


export default UpdateExam;