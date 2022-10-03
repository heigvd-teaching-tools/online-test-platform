import { useRouter } from 'next/router'

import { TextField, Stack, Button } from "@mui/material";
import { Stepper, Step, StepLabel, StepContent } from "@mui/material";

import LayoutMain from '../../components/layout/LayoutMain';
import { useInput } from '../../utils/useInput';
import { useSnackbar } from '../../context/SnackbarContext';

const NewExam = () => {
    const router = useRouter()
    const { show: showSnackbar } = useSnackbar();
    const { value:label, bind:bindLabel, setError:setErrorLabel } = useInput('');
    const { value:description, bind:bindDescription } = useInput('');

    const handleNext = async () => {
        if(label.length === 0){
            setErrorLabel({ error: true, helperText: 'Label is required' });
            return;
        }

        await fetch('/api/exams', {
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
        .then((res) => {
            res.json().then((data) => {
                if(res.ok) {
                    router.push(`/exams/${data.id}`);
                } else {
                    showSnackbar(data.message, 'error');
                } 
            });
        });        
    };

    return (
    <LayoutMain>
    <Stack sx={{ minWidth:'800px' }} spacing={2}>
        <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleNext}>Next</Button>
        </Stack>
        <Stepper activeStep={0} orientation="vertical">
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
                
            </Step>
        </Stepper>      
        <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleNext}>Next</Button>
        </Stack>
    </Stack>
    </LayoutMain>
    )
}




export default NewExam;