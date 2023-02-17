import {useState, useEffect, useCallback} from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import {Stack, Button, IconButton, Box} from "@mui/material";

import LayoutMain from '../../layout/LayoutMain';
import LoadingAnimation from '../../feedback/LoadingAnimation';

import { useSnackbar } from '../../../context/SnackbarContext';
import { Role } from "@prisma/client";
import Authorisation from "../../security/Authorisation";
import LayoutSplitScreen from "../../layout/LayoutSplitScreen";
import QuestionPages from "../../exam-session/take/QuestionPages";
import QuestionUpdate from "../../question/QuestionUpdate";

import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Image from "next/image";
import {useDebouncedCallback} from "use-debounce";

const PageUpdate = () => {
    const router = useRouter();

    const { show: showSnackbar } = useSnackbar();

    const { data: questions, mutate, error } = useSWR(
        `/api/exams/${router.query.examId}/questions`,
        router.query.examId ? (...args) => fetch(...args).then((res) => res.json()) : null,
        { revalidateOnFocus: false }
    );

    const onQuestionTypeChange = async (newQuestionType) => {
        delete question[question.type];
        if(!question[newQuestionType]){
            question[newQuestionType] = newQuestionType === 'multipleChoice' ? { options: [
                    { text: 'Option 1', isCorrect: false },
                    { text: 'Option 2', isCorrect: true },
                ] } : {};
        }
      //  setQuestion({ ...question });

        await onQuestionChange("type", newQuestionType); // type change is done by reference, so we just need to trigger a state change
    }

    const onQuestionChange = async (property, newValue) => {
        let question = questions[router.query.questionIndex - 1];
        if(typeof newValue === 'object'){
            // we keep eventual existing properties when a property is an object
            question[property] = {
                ...question[property],
                ...newValue
            };
        }else{
            question[property] = newValue;
        }
       //setQuestion({ ...question });
        await saveQuestion(question);
    }

    const saveQuestion = useDebouncedCallback(useCallback(async (question) => {
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
                showSnackbar('Question saved');
                mutate(questions.map((q) => q.id === question.id ? question : q));
            }).catch(() => {
                showSnackbar('Error saving questions', 'error');
            });
    } , [showSnackbar]), 500);

    const createQuestion = useCallback(async () => {
        await fetch(`/api/exams/${router.query.examId}/questions`, {
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
                showSnackbar('Question created', createdQuestion);
                mutate([...questions, createdQuestion]);
                router.push(`/exams/${router.query.examId}/questions/${questions.length + 1}`);
            }).catch(() => {
                showSnackbar('Error creating questions', 'error');
            });
    } , [router.query.examId, showSnackbar, questions, mutate]);


    if (error) return <div>failed to load</div>
    if (!questions) return <LoadingAnimation />

    return (
        <Authorisation allowRoles={[ Role.PROFESSOR ]}>
            <LayoutMain
                header={
                    <Stack direction="row" alignItems="center">
                        <Link href={`/exams`}>
                            <Button startIcon={<ArrowBackIosIcon />}>
                                Back
                            </Button>
                        </Link>
                        { questions &&
                            <QuestionPages
                                questions={questions}
                                activeQuestion={questions[parseInt(router.query.questionIndex) - 1]}
                                link={(_, index) => {
                                    console.log("index", index);
                                    return `/exams/${router.query.examId}/questions/${index + 1}`;
                                }}
                            />
                        }
                        <IconButton color="primary" onClick={createQuestion}>
                            <Image alt="Add" src="/svg/icons/add.svg" layout="fixed" width="18" height="18" />
                        </IconButton>
                    </Stack>
                }
            >
                {
                    questions && questions.length > 0 && questions.map((q, index) =>
                        <Box sx={{ display: (index + 1 === parseInt(router.query.questionIndex)) ? 'block' : 'none' }}>
                            { /*
                                Not a traditional conditional rendering approach.
                                Used to mount all the components at once, so that each component state can be updated independently.
                                Instead of conditionally rendering the component, we just hide it with CSS.
                            */ }
                            <QuestionUpdate
                                key={q.id}
                                index={index + 1}
                                question={q}
                                onQuestionTypeChange={onQuestionTypeChange}
                                onQuestionChange={onQuestionChange}
                            />
                        </Box>
                    )
                }

            </LayoutMain>
        </Authorisation>
    )
}

export default PageUpdate;
