import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Stepper, Step, StepLabel, StepContent, Stack, Button, TextField, Autocomplete, Box, CardContent, Typography, Paper } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import { useInput } from '../../utils/useInput';

import LoadingAnimation from '../../components/layout/LoadingAnimation';
import QuestionManager from '../../components/question/QuestionManager';

import { useSnackbar } from '../../context/SnackbarContext';
import AlertFeedback from '../../components/feedback/Alert';

const UpdateSessionExam = () => {
    const { query: { id }} = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const [ saveRunning, setSaveRunning ] = useState(false);

    

    const { data: examSession, errorSession } = useSWR(
        `/api/exam-sessions/${id}`,
        id ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    const { data: exams, errorExams } = useSWR(
        `/api/exams`, 
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { data: sessionQuestions, errorSessionQuestions } = useSWR(
        `/api/exam-sessions/${id}/questions`, 
        id ? (...args) => fetch(...args).then((res) => res.json()) : null
    );
        
    const [ selectedExam, setSelectedExam ] = useState(null);

    const { data: examQuestions, errorExamQuestions } = useSWR(
        `/api/exams/${selectedExam && selectedExam.id}/questions`, 
        selectedExam ? (...args) => fetch(...args).then((res) => res.json()) : null
    );
    
    const [ activeStep, setActiveStep ] = useState(1);
    const [ questionError, setQuestionError ] = useState(false);
    

    const { value:label, bind:bindLabel, setValue:setLabel, setError:setErrorLabel } = useInput('');
    const { value:conditions, bind:bindConditions, setValue:setConditions } = useInput('');
    
    const [ questions, setQuestions ] = useState([]);
    
    const [ participants, setParticipants ] = useState([]);

    useEffect(() => {
        console.log("questions", questions);
    }, [questions]);

    useEffect(() => {
        if(examSession) {
            setLabel(examSession.label);
            setConditions(examSession.conditions);
            setParticipants(examSession.participants);
        }
    }, [examSession, setLabel, setConditions, setParticipants]);

    useEffect(() => {
        if(examQuestions) {
            setQuestions(examQuestions);
        }
    } , [examQuestions, setQuestions]);

    useEffect(() => {
        if(sessionQuestions) {
            setQuestions(sessionQuestions);
            setActiveStep(2);
        }
    } , [sessionQuestions, setQuestions]);

    useEffect(() => {
        setQuestionError(false);
        if(!selectedExam && !sessionQuestions) {
            setQuestions([]);
        }
    } , [selectedExam, sessionQuestions, setQuestions]);


    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
            case 1:
                if(questions && questions.length === 0){
                    setQuestionError(true);
                }
                return questions && questions.length > 0;
                
           
            default:
                return true;
        }
    }

    const onExamChange = (value) => {
        setSelectedExam(value);
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
            <Paper>
                <Stack direction="row" p={2} justifyContent="space-between" alignItems="center">
                    <Box><Typography variant="caption" size="small">{`http://localhost:3000/exam-sessions/${id}/join`}</Typography></Box>
                    <Box><Button variant="outlined" color="secondary" onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/exam-sessions/${id}/join`);
                    }}>Copy</Button></Box>
                </Stack>
            </Paper>
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
                        <Autocomplete
                            id="exam-id"
                            inputValue={selectedExam ? selectedExam.label : ''}
                            options={exams || []}
                            renderInput={(params) => <TextField {...params} label="Find the reference exam" />}
                            noOptionsText="No exams found"
                            onChange={(_, value) => onExamChange(value)}
                        />

                         { exams && exams.length === 0 && 
                           <Link href="/exams/new"><Button variant="contained">Create a new exam</Button></Link>
                         }

                         { questionError &&
                            <AlertFeedback severity="error">
                                You exam session has no questions. Please select the reference exam.
                            </AlertFeedback>
                         }

                        { selectedExam && 
                            <AlertFeedback severity="info">
                                The reference exam contains {selectedExam.questions.length} questions. Their copy will be assigned for this session.
                            </AlertFeedback>
                        }

                        { sessionQuestions && selectedExam && sessionQuestions.length > 0 && 
                            <AlertFeedback severity="warning">
                                This session already has {sessionQuestions.length} questions. They will be replaced by the questions of the reference exam.
                            </AlertFeedback>
                        }
            
                    </Stack>
                        
                    </StepContent>
                </Step>
                
                <Step key="prepare-session">
                    <StepLabel>Prepare and validate</StepLabel>
                    <StepContent>
                        <QuestionManager questions={questions} setQuestions={setQuestions} />
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
            { activeStep < 2 && <Button onClick={onNext}>Next</Button> }

            { activeStep === 2 && <LoadingButton startIcon={<SaveIcon />} variant="contained" color="primary" loading={saveRunning || false} onClick={onSave}>Save</LoadingButton> }
            
        </Stack>
    )
}


export default UpdateSessionExam;