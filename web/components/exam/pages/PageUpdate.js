import {useState, useEffect, useCallback} from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import {Stepper, Step, StepLabel, StepContent, Stack, Button, TextField, IconButton, Typography} from "@mui/material";
import { LoadingButton } from '@mui/lab';

import { useInput } from '../../../utils/useInput';

import LayoutMain from '../../layout/LayoutMain';
import LoadingAnimation from '../../feedback/LoadingAnimation';
import QuestionManager from '../../question/QuestionManager';

import { useSnackbar } from '../../../context/SnackbarContext';
import { Role } from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QuestionPages from "../../exam-session/take/QuestionPages";
import QuestionUpdate from "../../question/QuestionUpdate";
import QuestionTypeSpecific from "../../question/QuestionTypeSpecific";
import {useDebouncedCallback} from "use-debounce";
import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const PageUpdate = () => {
    const { query: { examId, questionIndex }} = useRouter();

    const { show: showSnackbar } = useSnackbar();

    const [ question, setQuestion ] = useState(null);

    const [ saveRunning, setSaveRunning ] = useState(false);

    const { data: questions, mutate, error } = useSWR(
        `/api/exams/${examId}/questions`,
        examId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    useEffect(() => {
        if(questions && questions.length >= questionIndex - 1){
            setQuestion(questions[questionIndex - 1]);
        }
    }, [questions, questionIndex]);

    const inputControl = (step) => {
        switch(step){
            case 0:
                if(label.length === 0){
                    setErrorLabel({ error: true, helperText: 'Label is required' });
                }
                return label.length > 0;
            case 1:
                if(questions.length === 0){
                    showSnackbar({ message: 'Exam must have at least one question', severity: 'error' });
                }
                return questions.length > 0;
            default:
                return true;
        }
    }

    const onQuestionTypeChange = async (newQuestionType) => {
        delete question[question.type];
        if(!question[newQuestionType]){
            question[newQuestionType] = newQuestionType === 'multipleChoice' ? { options: [
                    { text: 'Option 1', isCorrect: false },
                    { text: 'Option 2', isCorrect: true },
                ] } : {};
        }
        setQuestion({ ...question });

        await onQuestionChange("type", newQuestionType); // type change is done by reference, so we just need to trigger a state change
    }

    const onQuestionChange = async (property, newValue) => {
        if(typeof newValue === 'object'){
            // we keep eventual existing properties when a property is an object
            question[property] = {
                ...question[property],
                ...newValue
            };
        }else{
            question[property] = newValue;
        }
        setQuestion({ ...question });
        await saveQuestion(question);
    }

    const saveQuestion = useDebouncedCallback(useCallback(async (question) => {
        setSaveRunning(true);
        await fetch(`/api/questions`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ question })
        })
            .then((res) => res.json())
            .then((_) => {
                setSaveRunning(false);
            }).catch(() => {
                setSaveRunning(false);
                showSnackbar('Error saving question', 'error');
            });
    } , [showSnackbar]), 500);

    const createQuestion = useCallback(async () => {
        setSaveRunning(true);
        await fetch(`/api/exams/${examId}/questions`, {
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
                setQuestion(createdQuestion)
                mutate([...questions, createdQuestion]);
            }).catch(() => {
                showSnackbar('Error creating question', 'error');
            });
        setSaveRunning(false);
    } , [examId, setSaveRunning, showSnackbar, questions, mutate]);

    const deleteQuestion = useCallback(async () => {
        setSaveRunning(true);
        await fetch(`/api/questions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                question
            })
        })
            .then((res) => res.json())
            .then(() => {
                mutate(questions.filter((q) => q.id !== question.id));
                showSnackbar('Question delete successful');
            }).catch(() => {
                showSnackbar('Error deleting question', 'error');
            });
        setSaveRunning(false);
    } , [setSaveRunning, showSnackbar, question]);

    if (error) return <div>failed to load</div>
    if (!questions) return <LoadingAnimation />

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            { question && (
                <LayoutSplitScreen
                    header={
                        <Stack direction="row" alignItems="center">
                            <Link href={`/exams`}>
                               <Button startIcon={<ArrowBackIosIcon />}>
                                      Back
                               </Button>
                            </Link>
                            { question &&
                                <QuestionPages
                                    questions={questions}
                                    activeQuestion={question}
                                    link={(_, index) => `/exams/${examId}/question/${index + 1}`}
                                />
                            }
                            <LoadingButton loading={saveRunning} color="primary" onClick={createQuestion}>Add question</LoadingButton>
                            <LoadingButton loading={saveRunning} color="primary" onClick={deleteQuestion}>Delete</LoadingButton>
                        </Stack>
                    }
                    leftPanel={
                        <QuestionUpdate
                            index={questionIndex}
                            question={question}
                            onQuestionChange={onQuestionChange}
                            onQuestionTypeChange={onQuestionTypeChange}
                        />
                    }
                    rightPanel={
                        <QuestionTypeSpecific
                            question={question}
                            onQuestionChange={onQuestionChange}
                        />
                    }
                />
            )}
        </Authorisation>
    )
}

export default PageUpdate;
