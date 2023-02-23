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

    const onQuestionChange = useCallback(async (questionId, property, newValue) => {
        let question = questions.find((q) => q.id === questionId);
        if(typeof newValue === 'object'){
            // we keep eventual existing properties when a property is an object
            question[property] = {
                ...question[property],
                ...newValue
            };
        }else{
            question[property] = newValue;
        }
        await saveQuestion(question);
    }, [questions, saveQuestion]);

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
            .then(async (createdQuestion) => {
                showSnackbar('Question created', "success");
                await mutate([...questions, createdQuestion]);
                await router.push(`/exams/${router.query.examId}/questions/${questions.length + 1}`);
            }).catch(() => {
                showSnackbar('Error creating questions', 'error');
            });
    } , [router.query.examId, showSnackbar, questions, mutate]);

    const deleteQuestion = useCallback(async (questionId) => {
        let question = questions.find((q) => q.id === questionId);
        await fetch(`/api/questions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ question })
        })
            .then((res) => res.json())
            .then(() => {
                mutate(questions.filter((q) => q.id !== question.id).map((q) => {
                    if(q.order > question.order){
                        q.order--;
                    }
                    return q;
                }));
                showSnackbar('Question delete successful');
            }).catch(() => {
                showSnackbar('Error deleting questions', 'error');
            });
    } , [questions, showSnackbar]);

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
                showSnackbar('Question saved', "success");
            }).catch(() => {
                showSnackbar('Error saving questions', 'error');
            });
    } , [showSnackbar]), 500);

    const savePositions = useCallback(async () => {
        await fetch('/api/questions/order', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                questions: questions.map((q) => ({
                    id: q.id,
                    order: q.order
                }))
            })
        })
            .then((res) => res.json())
            .then(() => {
                showSnackbar('Question order changed');
            }).catch(() => {
                showSnackbar('Error changing questions order', 'error');
            });
    }, [questions, showSnackbar]);

    const updateQuestionOrder = useCallback(async (order, offset) => {
        if (order + offset < 0 || order + offset >= questions.length) {
            return;
        }

        await mutate((questions) => {
            const temp = [...questions];
            const currentQuestion = temp[order];
            const questionToSwapWith = temp[order + offset];

            currentQuestion.order = order + offset;
            questionToSwapWith.order = order;

            temp[order] = questionToSwapWith;
            temp[order + offset] = currentQuestion;

            return temp;
        }, false);

        await savePositions();
        await router.push(`/exams/${router.query.examId}/questions/${order + offset + 1}`);
    }, [mutate, savePositions, questions, router]);


    const orderDecrease = useCallback(async (order) => await updateQuestionOrder(order, -1), [updateQuestionOrder]);
    const orderIncrease = useCallback(async (order) => await updateQuestionOrder(order, 1), [updateQuestionOrder]);

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
                        <Box key={index} sx={{
                            width:'100%', height:'100%',
                            display: (index + 1 === parseInt(router.query.questionIndex)) ? 'block' : 'none'
                        }}>
                            { /*
                                Not a traditional conditional rendering approach.
                                Used to mount all the components at once, so that each component state can be updated independently.
                                Instead of conditionally rendering the component, we just hide it with CSS.
                            */ }
                            <QuestionUpdate
                                key={q.id}
                                index={index + 1}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onQuestionDelete={deleteQuestion}
                                onClickLeft={orderDecrease}
                                onClickRight={orderIncrease}
                            />
                        </Box>
                    )
                }

            </LayoutMain>
        </Authorisation>
    )
}

export default PageUpdate;
