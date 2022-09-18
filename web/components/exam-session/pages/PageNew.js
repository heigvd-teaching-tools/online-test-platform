import { useState } from 'react';
import { useRouter } from 'next/router'
import { ExamSessionPhase } from '@prisma/client';

import LayoutMain from '../../layout/LayoutMain';
import { Stack, Button  } from "@mui/material";
import { useSnackbar } from '../../../context/SnackbarContext';

import StepReferenceExam from '../draft/StepReferenceExam';

const PageNew = () => {
    const router = useRouter();
    const { show: showSnackbar } = useSnackbar();
    const [ questions, setQuestions ] = useState();

    const onChangeRefenceExam = (_, questions) => setQuestions(questions);

    const handleNext = async () => {
        if(!questions || questions && questions.length === 0){
            showSnackbar('You exam session has no questions. Please select the reference exam.', 'error');
            return;
        }      
        
        let response = await fetch('/api/exam-sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                phase: ExamSessionPhase.DRAFT,
                questions
            })
        });
        
        let examSession = await response.json();
        router.push(`/exam-sessions/${examSession.id}/draft/1`);
    };

    return (
    <LayoutMain>
    <Stack sx={{ width:'100%' }} spacing={2}>
        <StepReferenceExam 
            onChange={onChangeRefenceExam}
        />
            
        <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleNext}>Next</Button>
        </Stack>
    </Stack>
    </LayoutMain>
    )
}




export default PageNew;