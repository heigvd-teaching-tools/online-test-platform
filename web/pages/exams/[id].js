import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import { useInput } from '../../utils/useInput';

import LoadingAnimation from '../../components/layout/LoadingAnimation';
import QuestionManager from '../../components/question/QuestionManager';

import { useSnackbar } from '../../context/SnackbarContext';

const UpdateExam = () => {
    const { query: { id }} = useRouter();

    const [ activeStep, setActiveStep ] = useState(1);

    const { data: exam, error } = useSWR(
        `/api/exams/${id}`,
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { data: examQuestions, errorSessionQuestions } = useSWR(
        `/api/exams/${id}/questions`, 
        id ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription, setValue:setDescription } = useInput('');
    const [ questions, setQuestions ] = useState([]);

    useEffect(() => {
        if(exam) {
            setLabel(exam.label);
            setDescription(exam.description);
        }
    }, [exam, setLabel, setDescription]);

    useEffect(() => {
        if(examQuestions) {
            setQuestions(examQuestions);
        }
    } , [examQuestions, setQuestions]);

    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
            case 1:
                if(questions.length === 0){
                    showSnackbar({ message: 'Exam must have at least one question', severity: 'error' });
                }
                return questions.length > 0;
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

           
    if (error) return <div>failed to load</div>
    if (!exam) return <LoadingAnimation /> 

    return (
        <Stack sx={{ width:'100%' }} spacing={4} pb={40}>
            <StepNav activeStep={activeStep} onBack={handleBack} onNext={handleNext}  />
            
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
                            <QuestionManager 
                                partOf="exams"
                                partOfId={id}
                                questions={questions} 
                                setQuestions={setQuestions} 
                            />
                        </Stack>
                    </StepContent>
                </Step>
            </Stepper>      

            <StepNav activeStep={activeStep} onBack={handleBack} onNext={handleNext}  />

        </Stack>

    )
}

const StepNav = ({ activeStep, onBack, onNext }) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={onBack} disabled={activeStep === 0}>Back</Button>
            { activeStep ===  0 && <Button onClick={onNext}>Next</Button> }

            { activeStep ===  1 && <Button onClick={onNext}>Finish</Button> }
        </Stack>
    )
}

export default UpdateExam;