import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField, Typography, Autocomplete } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import { useInput } from '../../utils/useInput';

import LoadingAnimation from '../../components/layout/LoadingAnimation';
import QuestionList from '../../components/question/QuestionList';

import { useSnackbar } from '../../context/SnackbarContext';

const UpdateExam = () => {
    const { query: { id }} = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const [ saveRunning, setSaveRunning ] = useState(false);

    const [ activeStep, setActiveStep ] = useState(1);

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${id}`,
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { data: exams, errorExams } = useSWR(
        `/api/exams`, 
        (...args) => fetch(...args).then((res) => res.json())
      );

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput('');
    const { value:conditions, bind:bindConditions, setValue:setConditions } = useInput('');
    
    const [ questions, setQuestions ] = useState([]);
    const [ participants, setParticipants ] = useState([]);

    useEffect(() => {
        if(examSession) {
            setLabel(examSession.label);
            setConditions(examSession.conditions);
            setQuestions(examSession.questions);
            setParticipants(examSession.participants);
        }
    }, [examSession, setLabel, setConditions, setQuestions, setParticipants]);


    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
           
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
        await fetch(`/api/exam-sessions/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                label,
                questions, participants
            })
        })
        .then((res) => res.json())
        .then(() => {
            showSnackbar('Exam session updated successfully');
        }).catch(() => {
            showSnackbar('Error updating exam session', 'error');
        });
        setSaveRunning(false);
    };
    
    if (errorSession) return <div>failed to load</div>
    if (!examSession) return <LoadingAnimation /> 

    return (
        <Stack sx={{ minWidth:'800px' }} spacing={4} pb={40}>
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
                <StepContent>
                    <Stack spacing={2} pt={2}>
                        <Typography variant="body1">
                            The copy of the exam question base will be used to setup this session.
                        </Typography>

                        <FindExam label="Find the reference exam" id="exam-id" options={exams} />
                        
                        { !exams || exams.length < 2 && (
                            <>
                            <Typography variant="body1" color="error">No exams found. </Typography>
                            <Link href="/exams/new"><Button variant="contained">Create a new exam</Button></Link>
                            </>
                        )}
                    
                
                    </Stack>
                        
                    </StepContent>
                </Step>
                
                <Step key="prepare-session">
                    <StepLabel>Prepare the session</StepLabel>
                    <StepContent>
                        
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

const FindExam = ({label, id, options}) => {
    return (
      <Autocomplete
        disablePortal
        id={id}
        options={options}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    );
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
        }
    }
}


export default UpdateExam;