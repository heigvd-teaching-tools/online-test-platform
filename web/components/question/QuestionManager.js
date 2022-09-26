import { useCallback, useState } from 'react';
import useSWR from 'swr';

import { Stack } from "@mui/material";
import Question from "./Question";
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../context/SnackbarContext';

const QuestionManager = ({ partOf, partOfId }) => {

    const { data: questions, mutate } = useSWR(
        `/api/${partOf}/${partOfId}/questions`, 
        partOfId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const [ createRunning, setCreateRunning ] = useState(false);
    const { show: showSnackbar } = useSnackbar(); 

    const handleQuestionUp = useCallback(async (index) => {
        if(!questions || index === 0) return;
        await mutate((questions) => {
            const newQuestions = [...questions];
            const temp = newQuestions[index];
            newQuestions[index] = newQuestions[index - 1];
            newQuestions[index - 1] = temp;
            return newQuestions;
        }, false);
        await savePositions();
    } , [mutate, savePositions, questions]);

    const handleQuestionDown = useCallback(async (index) => {
        if(index === questions.length - 1) return;
        await mutate((questions) => {
            const newQuestions = [...questions];
            const temp = newQuestions[index];
            newQuestions[index] = newQuestions[index + 1];
            newQuestions[index + 1] = temp;
            return newQuestions;
        }, false);
        await savePositions();
    } , [mutate, savePositions, questions]);

    const savePositions = useCallback(async () => {
        await fetch('/api/questions/order', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                questions: questions.map(q => ({
                    id: q.id,
                    order: q.order
                }))
            })
        })
        .then((res) => res.json())
        .then(() => {
            showSnackbar('Question order changed');
        }).catch(() => {
            showSnackbar('Error changing question order', 'error');
        });
    }, [questions, showSnackbar]);


    const createQuestion = useCallback(async () => {
        setCreateRunning(true);
        await fetch(`/api/${partOf}/${partOfId}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                order: questions.length
            })
        })
        .then((res) => res.json())
        .then((createdQuestion) => {
            showSnackbar('New question created');
            mutate([...questions, createdQuestion]);
        }).catch(() => {
            showSnackbar('Error creating question', 'error');
        });
        setCreateRunning(false);
    } , [partOf, partOfId, setCreateRunning, showSnackbar, questions, mutate]);   

    return (
        <Stack spacing={4} pt={2}>
            {questions && questions.map((question, index) =>
                <Question 
                    key={index} 
                    index={index} 
                    lastIndex={questions.length}
                    question={question} 
                    clickUp={handleQuestionUp}
                    clickDown={handleQuestionDown}
                    onDelete={() => {
                        mutate(questions.filter((q, i) => i !== index));
                    }}
                                      
                />
            )}
            <LoadingButton variant="outlined" loading={createRunning} color="primary" onClick={createQuestion}>Add question</LoadingButton>
        </Stack>
    )
}

export default QuestionManager;