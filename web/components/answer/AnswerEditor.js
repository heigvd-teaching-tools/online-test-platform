import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';

import { QuestionType, StudentFilePermission } from '@prisma/client';

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';
import Web from '../question/type_specific/Web';
import {Box, IconButton, Stack, Typography} from "@mui/material";
import FileEditor from "../question/type_specific/code/files/FileEditor";
import Image from "next/image";
import CodeCheck from "../question/type_specific/code/CodeCheck";
import useSWR from "swr";
import {useSnackbar} from "../../context/SnackbarContext";
import {useDebouncedCallback} from "use-debounce";

const AnswerEditor = ({ question, onAnswer }) => {
    const onAnswerChange = useCallback(async (updatedStudentAnswer) => {
        if(onAnswer){
            onAnswer(question, updatedStudentAnswer);
        }
    }, [question]);
    return (
        question && (
            question.type === QuestionType.trueFalse && (
                <AnswerTrueFalse
                    question={question}
                    answer={question.studentAnswer[0]}
                    onAnswerChange={onAnswerChange}
                />
            )
            ||
            question.type === QuestionType.multipleChoice && (
                <AnswerMultipleChoice
                    question={question}
                    answer={question.studentAnswer[0]}
                    onAnswerChange={onAnswerChange}
                />
            )
            ||
            question.type === QuestionType.essay && (
                <AnswerEssay
                    question={question}
                    answer={question.studentAnswer[0]}
                    onAnswerChange={onAnswerChange}
                />
            )
            ||
            question.type === QuestionType.code && (
                <AnswerCode
                    question={question}
                    answer={question.studentAnswer[0]}
                    onAnswerChange={onAnswerChange}
                />
            )
            ||
            question.type === QuestionType.web && (
                <AnswerWeb
                    question={question}
                    answer={question.studentAnswer[0]}
                    onAnswerChange={onAnswerChange}
                />
            )
        )
    )
}


const AnswerCode  = ({ question, answer, onAnswerChange }) => {

    const { showTopRight: showSnackbar } = useSnackbar();

    const onFileChange = useCallback(async (file) => {
        const updatedStudentAnswer = await fetch(`/api/answer/${question.id}/code/${file.id}`, {
           method: 'PUT',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({file})
       }).then(res => res.json());
       onAnswerChange && onAnswerChange(updatedStudentAnswer);
    }, [question, onAnswerChange]);

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
                            readonlyContent={answerToFile.studentPermission === StudentFilePermission.VIEW}
                            secondaryActions={
                                answerToFile.studentPermission === StudentFilePermission.VIEW && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Image src="/svg/icons/viewable.svg" width={24} height={24} minWidth={24} />
                                        <Typography variant="caption">view</Typography>
                                    </Stack>
                                ) ||
                                answerToFile.studentPermission === StudentFilePermission.UPDATE && (
                                    <Stack direction="row" spacing={1}  alignItems="center">
                                        <Image src="/svg/icons/editable.svg" width={24} height={24} minWidth={24} />
                                        <Typography variant="caption">edit</Typography>
                                    </Stack>
                                )
                            }

                            onChange={debouncedOnChange}

                        />
                    ))}
                </Box>

                <Stack zIndex={2} position="absolute" maxHeight="100%" width="100%" overflow="auto" bottom={0} left={0}>
                    <CodeCheck
                        codeCheckAction={() => fetch(`/api/sandbox/${question.id}/student`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        })}
                    />
                </Stack>
            </Stack>
        )
    )
}

const AnswerMultipleChoice = ({ question, answer, onAnswerChange }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const [ options, setOptions ] = useState(undefined);

    useEffect(() => {
        if(question.multipleChoice?.options && answer){
            // merge the options with the student answer

            let allOptions = question.multipleChoice.options;
            let studentOptions = answer.multipleChoice?.options;

            setOptions(allOptions.map(option => {
                return {
                    ...option,
                    isCorrect: studentOptions && studentOptions.some(studentOption => studentOption.id === option.id)
                }
            }));

        }
    }, [answer]);

    const onOptionChange = useCallback(async (options, index) => {
        const changedOption = options[index];
        const method = changedOption.isCorrect ? 'POST' : 'DELETE';
        const updatedStudentAnswer = await fetch(`/api/answer/${question.id}/multi-choice/options`, {
            method: method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ option: changedOption })
        }).then(res => res.json());
        onAnswerChange && onAnswerChange(updatedStudentAnswer);
    }, [question, onAnswerChange]);

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

const AnswerTrueFalse = ({ question, answer, onAnswerChange }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const onTrueFalseChange = useCallback(async (isTrue) => {
        const answer = { answer: isTrue !== undefined ? {
            isTrue: isTrue
        } : undefined};

        const updatedStudentAnswer = await fetch(`/api/answer/${question.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answer)
        }).then(res => res.json());
        onAnswerChange && onAnswerChange(updatedStudentAnswer);
    }, [question, onAnswerChange]);

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

const AnswerEssay = ({ question, answer, onAnswerChange }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const onEssayChange = useCallback(async (content) => {
        if(answer.essay.content === content) return;
        const updatedStudentAnswer = await fetch(`/api/answer/${question.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: content ? {
                    content: content
                } : undefined})
        }).then(res => res.json());
        onAnswerChange && onAnswerChange(updatedStudentAnswer);
    }, [question, answer, onAnswerChange]);

    const debouncedOnChange = useDebouncedCallback(onEssayChange, 500);

    return (
        answer.essay && (
            <Essay
                id={`answer-editor-${question.id}`}
                content={answer.essay.content}
                onChange={debouncedOnChange}
            />
        )
    )
}

const AnswerWeb = ({ question, answer, onAnswerChange }) => {
    const { showTopRight: showSnackbar } = useSnackbar();

    const onWebChange = useCallback(async (web) => {
        const isEmptyWeb = !web || !web.html && !web.css && !web.js;
        const answer = {
            answer: !isEmptyWeb ? {
                ...web
            } : undefined
        };

        const updatedStudentAnswer = await fetch(`/api/answer/${question.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answer)
        }).then(res => res.json());
        onAnswerChange && onAnswerChange(updatedStudentAnswer);
    }, [question, onAnswerChange]);

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
