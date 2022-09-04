import { useCallback, useState } from 'react';
import { Stack } from "@mui/material";
import Question from "./Question";
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../context/SnackbarContext';

const QuestionManager = ({ partOf, partOfId, questions, setQuestions }) => {
    const [ createRunning, setCreateRunning ] = useState(false);
    const { show: showSnackbar } = useSnackbar();

    const handleQuestionUp = useCallback((index) => {
        if(index === 0) return;
        const prev = questions[index - 1];
        questions[index - 1] = questions[index];
        questions[index] = prev;
        setQuestions([...questions]);
    } , [setQuestions, questions]);

    const handleQuestionDown = useCallback((index) => {
        if(index === questions.length - 1) return;
        const next = questions[index + 1];
        questions[index + 1] = questions[index];
        questions[index] = next;
        setQuestions([...questions]);
    } , [setQuestions, questions]);

    const createQuestion = useCallback(async () => {
        setCreateRunning(true);
        await fetch(`/api/${partOf}/${partOfId}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then((res) => res.json())
        .then((createdQuestion) => {
            showSnackbar('New question created');
            setQuestions([...questions, createdQuestion]);
        }).catch(() => {
            showSnackbar('Error creating question', 'error');
        });
        setCreateRunning(false);
    } , [partOf, partOfId, setCreateRunning, showSnackbar, questions, setQuestions]);

    return (
        <Stack spacing={4} pt={2}>
            {questions && questions.map((question, index) =>
                <Question 
                    key={index} 
                    index={index} 
                    question={question} 
                    clickUp={handleQuestionUp}
                    clickDown={handleQuestionDown}
                    onDelete={() => {
                        const newQuestions = questions.filter((q, i) => i !== index);
                        setQuestions(newQuestions);
                    }}
                    onSave={(newQuestion) => {
                        questions[index] = newQuestion;
                    }}                        
                />
            )}
            <LoadingButton variant="outlined" loading={createRunning} color="primary" onClick={createQuestion}>Add question</LoadingButton>
        </Stack>
    )
}

export default QuestionManager;