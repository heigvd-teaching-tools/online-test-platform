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
    const { show: showSnackbar } = useSnackbar();
    const [ saveRunning, setSaveRunning ] = useState(false);

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
                if(questions.length <= 0){
                    setErrorNumberOfQuestions({ error: true, helperText: 'You must specify at least one question' });
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

    const handleSave = async () => {
        setSaveRunning(true);
        await fetch(`/api/exams/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                description
            })
        })
        .then((res) => res.json())
        .then(() => {
            showSnackbar('Exam general informations updated');
        }).catch(() => {
            showSnackbar('Error updating exam', 'error');
        });
        setSaveRunning(false);
    };

       
    if (error) return <div>failed to load</div>
    if (!exam) return <LoadingAnimation /> 

    return (
        <Stack sx={{ width:'100%' }} spacing={4} pb={40}>
            <StepNav activeStep={activeStep} saveRunning={saveRunning} onBack={handleBack} onNext={handleNext} onSave={handleSave}  />
            
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

            <StepNav activeStep={activeStep} saveRunning={saveRunning} onBack={handleBack} onNext={handleNext} onSave={handleSave}  />

        </Stack>

    )
}

const StepNav = ({ activeStep, saveRunning, onBack, onNext, onSave }) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={onBack} disabled={activeStep === 0}>Back</Button>
            { activeStep ===  0 && <Button onClick={onNext}>Next</Button> }

            { activeStep === 1 && <LoadingButton startIcon={<SaveIcon />} variant="contained" color="primary" loading={saveRunning || false} onClick={onSave}>Save</LoadingButton> }
            
        </Stack>
    )
}

const defaultQuestion = {
    'type'      : 'multipleChoice',
    'points'    : 4,
    'content'   : '',
    'multipleChoice': {
        'options': []
    }
}


export default UpdateExam;