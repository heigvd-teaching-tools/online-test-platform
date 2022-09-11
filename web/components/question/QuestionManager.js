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
        (async () => {
            questions[index].position--;
            questions[index - 1].position++;
            questions.sort((a,b) => a.position - b.position);
            setQuestions([...questions]);
            await savePositions();
        })();
    } , [setQuestions, questions, savePositions]);

    const handleQuestionDown = useCallback((index) => {
        if(index === questions.length - 1) return;
        (async () => {
            questions[index].position++;
            questions[index + 1].position--;
            questions.sort((a,b) => a.position - b.position);
            setQuestions([...questions]);
            await savePositions();
        })();
    } , [setQuestions, questions, savePositions]);

    const savePositions = useCallback(async () => {
        await fetch('/api/questions/positions', {
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
            showSnackbar('Question positions changed');
        }).catch(() => {
            showSnackbar('Error changing question positions', 'error');
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
                position: questions.length
            })
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
                    lastIndex={questions.length}
                    question={question} 
                    clickUp={handleQuestionUp}
                    clickDown={handleQuestionDown}
                    onDelete={() => {
                        const newQuestions = questions.filter((q, i) => i !== index);
                        setQuestions(newQuestions);
                    }}
                                      
                />
            )}
            <LoadingButton variant="outlined" loading={createRunning} color="primary" onClick={createQuestion}>Add question</LoadingButton>
        </Stack>
    )
}

export default QuestionManager;