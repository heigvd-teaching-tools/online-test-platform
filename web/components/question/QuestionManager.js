import { useCallback } from 'react';
import { Stack } from "@mui/material";
import Question from "./Question";

const QuestionManager = ({questions, setQuestions}) => {

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


    return (
        <Stack spacing={4} pt={2}>
            {questions && questions.map((question, index) =>
                <Question 
                    key={index} 
                    index={index} 
                    question={question} 
                    clickUp={handleQuestionUp}
                    clickDown={handleQuestionDown}
                />
            )}
        </Stack>
    )
}

export default QuestionManager;