import React, { useState, useEffect, useCallback } from 'react';

import { QuestionType, StudentAnswerStatus } from '@prisma/client';

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';
import Web from '../question/type_specific/Web';
import {Box, IconButton, Stack} from "@mui/material";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import Image from "next/image";
import CodeCheck from "../question/type_specific/code/CodeCheck";
import useSWR from "swr";
import {useSnackbar} from "../../context/SnackbarContext";
import {useDebouncedCallback} from "use-debounce";

const AnswerEditor = ({ question, onAnswer }) => {
    return (
        question && (
            question.type === QuestionType.trueFalse && (
                <AnswerTrueFalse
                    question={question}
                />
            )
            ||
            question.type === QuestionType.multipleChoice && (
                <AnswerMultipleChoice
                    question={question}
                />
            )
            ||
            question.type === QuestionType.essay && (
                <AnswerEssay
                    question={question}
                />
            )
            ||
            question.type === QuestionType.code && (
                <AnswerCode
                    question={question}
                />
            )
            ||
            question.type === QuestionType.web && (
                <AnswerWeb
                    question={question}
                />
            )
        )
    )
}


const AnswerCode  = ({ question }) => {

    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

   const onFileChange = useCallback(async (file) => {
       await fetch(`/api/answer/${question.id}/code/${file.id}`, {
           method: 'PUT',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({file})
       });
    }, [question, mutate]);

    const debouncedOnChange = useDebouncedCallback(onFileChange, 500);

    return (
        answer?.code && (
            <Stack position="relative" height="100%">
                <Box height="100%" overflow="auto" pb={16}>
                    { answer.code.files?.map((answerToFile, index) => (
                        <FileEditor
                            key={index}
                            file={answerToFile.file}
                            readonlyPath
                            onChange={debouncedOnChange}

                        />
                    ))}
                </Box>

                <Stack zIndex={2} position="absolute" maxHeight="100%" width="100%" overflow="auto" bottom={0} left={0}>
                    <CodeCheck
                        questionId={question.id}
                        files={answer.code.files?.map(file => file.file)}
                    />
                </Stack>
            </Stack>
        )
    )
}

const AnswerMultipleChoice = ({ question }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const [ options, setOptions ] = useState(undefined);

    useEffect(() => {
        if(question && answer){
            // merge the options with the student answer

            let allOptions = question.multipleChoice?.options;
            let studentOptions = answer.multipleChoice?.options;

            setOptions(allOptions.map(option => {
                return {
                    ...option,
                    isCorrect: studentOptions && studentOptions.some(studentOption => studentOption.id === option.id)
                }
            }));

        }
    }, [question, answer]);

    const onOptionChange = useCallback(async (options, index) => {
        const changedOption = options[index];
        const method = changedOption.isCorrect ? 'POST' : 'DELETE';
        await fetch(`/api/answer/${question.id}/multi-choice/options`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ option: changedOption })
        });
    }, [question, mutate]);

    return(
        answer?.multipleChoice && options && (
        <MultipleChoice
            id={`answer-editor-${question.id}`}
            selectOnly
            options={options}
            onChange={onOptionChange}
        />
        )
    )
}

const AnswerTrueFalse = ({ question }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const onTrueFalseChange = useCallback(async (isTrue) => {
        await fetch(`/api/answer/${question.id}/true-false`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isTrue })
        });
    }, [question, mutate]);

    return (
        answer?.trueFalse && (
            <TrueFalse
                id={`answer-editor-${question.id}`}
                allowUndefined={true}
                isTrue={answer.trueFalse.isTrue}
                onChange={onTrueFalseChange}
            />
        )
    )
}

const AnswerEssay = ({ question }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const onEssayChange = useCallback(async (content) => {
        await fetch(`/api/answer/${question.id}/essay`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
    }, [question, mutate]);

    const debouncedOnChange = useDebouncedCallback(onEssayChange, 500);

    return (
        answer?.essay && (
            <Essay
                id={`answer-editor-${question.id}`}
                content={answer.essay.content}
                onChange={debouncedOnChange}
            />
        )
    )
}

const AnswerWeb = ({ question }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

    const onWebChange = useCallback(async (web) => {
        await fetch(`/api/answer/${question.id}/web`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ web })
        });
    }, [question, mutate]);

    const debouncedOnChange = useDebouncedCallback(onWebChange, 500);

    return (
        answer?.web && (
            <Web
                id={`answer-editor-${question.id}`}
                web={answer.web}
                onChange={debouncedOnChange}
            />
        )
    )
}

export default AnswerEditor;
