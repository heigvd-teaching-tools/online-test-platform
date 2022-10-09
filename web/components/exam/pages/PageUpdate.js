import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import { useInput } from '../../../utils/useInput';

import LayoutMain from '../../layout/LayoutMain';
import LoadingAnimation from '../../feedback/LoadingAnimation';
import QuestionManager from '../../question/QuestionManager';

import { useSnackbar } from '../../../context/SnackbarContext';

const PageUpdate = () => {
    const { query: { id }} = useRouter();

    const { show: showSnackbar } = useSnackbar();

    const [ activeStep, setActiveStep ] = useState(1);
    const [ saveRunning, setSaveRunning ] = useState(false);

    const { data: exam, error } = useSWR(
        `/api/exams/${id}`,
        (...args) => fetch(...args).then((res) => res.json()),
        { revalidateOnFocus: false }
    );

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription, setValue:setDescription } = useInput('');

    useEffect(() => {
        if(exam) {
            setLabel(exam.label);
            setDescription(exam.description);
        }
    }, [exam, setLabel, setDescription]);

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
            if(activeStep === 0){
                saveExamGeneralInformation();
            }
            setActiveStep(activeStep + 1);
            
        }
    }

    const saveExamGeneralInformation = async (changePhase) => {
        setSaveRunning(true);
        
        await fetch(`/api/exams/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                description,
            })
        })
        .then((res) => res.json())
        .then((_) => {
            showSnackbar('Exam updated successfully');
        }).catch(() => {
            showSnackbar('Error updating exam', 'error');
        });
        setSaveRunning(false);
    };

           
    if (error) return <div>failed to load</div>
    if (!exam) return <LoadingAnimation /> 

    return (
        <LayoutMain>
        <Stack sx={{ width:'100%' }} spacing={4} pb={40}>
            <StepNav activeStep={activeStep} saveRunning={saveRunning} onBack={handleBack} onNext={handleNext}  />
            
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
                            />
                        </Stack>
                    </StepContent>
                </Step>
            </Stepper>      

            <StepNav activeStep={activeStep} saveRunning={saveRunning} onBack={handleBack} onNext={handleNext}  />

        </Stack>
        </LayoutMain>
    )
}

const StepNav = ({ activeStep, onBack, onNext, saveRunning }) => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Button onClick={onBack} disabled={activeStep === 0}>Back</Button>
            { activeStep ===  0 && <LoadingButton loading={saveRunning} onClick={onNext}>Next</LoadingButton> }

            { activeStep ===  1 && <Button onClick={onNext}>Finish</Button> }
        </Stack>
    )
}

export default PageUpdate;