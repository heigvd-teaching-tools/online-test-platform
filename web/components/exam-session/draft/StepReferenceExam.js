import { useEffect, useState } from 'react';
import Link from 'next/link'
import useSWR from 'swr';
import { Step, StepLabel, StepContent, Stack, TextField, Autocomplete, Button } from '@mui/material';

import AlertFeedback from '../../feedback/AlertFeedback';

const StepReferenceExam = ({ examSession, onChange }) => {
    
    const [ selectedExam, setSelectedExam ] = useState(null);
    const [ input, setInput ] = useState('');
    
    const { data: exams, errorExams } = useSWR(
        `/api/exams`, 
        (...args) => fetch(...args).then((res) => res.json())
    );

    const { data: sessionQuestions, errorSessionQuestions } = useSWR(
        `/api/exam-sessions/${examSession.id}/questions/with-answers/official`, 
        examSession && examSession.id ? (...args) => fetch(...args).then((res) => res.json()) : null
    );
  
    const { data: examQuestions, errorExamQuestions } = useSWR(
        `/api/exams/${selectedExam && selectedExam.id}/questions`, 
        selectedExam ? (...args) => fetch(...args).then((res) => res.json()) : null
    );

    useEffect(() => {
        if(examQuestions) {
            onChange(selectedExam, examQuestions);
        }
    } , [selectedExam, examQuestions, onChange]);
    
    useEffect(() => {
        if(sessionQuestions && sessionQuestions.length > 0){
            onChange(undefined, sessionQuestions);
        }
    }, [sessionQuestions, onChange]);

    return (
        <>
        <StepLabel>Chose the reference exam</StepLabel>
        <StepContent>
            <Stack spacing={2} pt={2}>                        
                <Autocomplete
                    id="exam-id"
                    inputValue={input}
                    options={exams || []}
                    renderInput={(params) => <TextField {...params} label="Find the reference exam" />}
                    noOptionsText="No exams found"
                    
                    onInputChange={(event, newInputValue) => {
                        setInput(newInputValue);
                    }}
                    onChange={(_, exam) => { 
                        setSelectedExam(exam);
                    }}
                />

                    { exams && exams.length === 0 && 
                    <Link href="/exams/new"><Button variant="contained">Create a new exam</Button></Link>
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

                { sessionQuestions && sessionQuestions.length > 0 && 
                    <AlertFeedback severity="success">
                        This session has {sessionQuestions.length} questions. 
                    </AlertFeedback>
                }
    
            </Stack>
                
        </StepContent>
        </>
    )
}

export default StepReferenceExam;