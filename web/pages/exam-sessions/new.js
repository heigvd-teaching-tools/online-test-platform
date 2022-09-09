import { useState } from 'react';
import { useRouter } from 'next/router'

import MainLayout from '../../components/layout/MainLayout';
import { TextField, Stack, Button } from "@mui/material";
import { Stepper, Step, StepLabel, StepContent } from "@mui/material";
import { useInput } from '../../utils/useInput';

const NewExam = () => {
    const router = useRouter();
    const [ activeStep, setActiveStep ] = useState(0);

    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:conditions, bind:bindConditions } = useInput('');

    const handleNext = async () => {
        if(label.length === 0){
            setErrorLabel({ error: true, helperText: 'Label is required' });
            return;
        }      
        
        let exam = await fetch('/api/exam-sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                conditions
            })
        });
        
        exam = await exam.json();
        router.push(`/exam-sessions/${exam.id}`);
    };

    return (
    <MainLayout>
    <Stack sx={{ minWidth:'800px' }} spacing={2}>
        <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleNext}>Next</Button>
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
                                label="Conditions"
                                id="exam-conditions"
                                fullWidth
                                multiline
                                rows={4}
                                value={conditions}
                                {...bindConditions}
                            />
                            
                        </Stack>
                    </StepContent>
            </Step>

            <Step key="chose-exam">
                <StepLabel>Chose the reference exam</StepLabel>
            </Step>
            
        </Stepper>      
        <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleNext}>Next</Button>
        </Stack>
    </Stack>
    </MainLayout>
    )
}




export default NewExam;