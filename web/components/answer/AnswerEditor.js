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

const AnswerEditor = ({ question, onAnswer }) => {
    const [ answer, setAnswer ] = useState(undefined);

    const onAnswerByType = useCallback((newAnswer) => {
        /*
            When calling the onAnswer callback, we pass the question and the answer.
            If the answer is undefined, it means that the user wants to remove the answer.
            Otherwise, we pass the answer object to update the answer.
        */
        switch(answer.type) {
            // notify with undefined to remove answer
            case QuestionType.trueFalse:
                onAnswer(question, newAnswer !== undefined ? {
                    isTrue: newAnswer
                } : undefined);
                break;
            case QuestionType.multipleChoice:
                let selectedOptions = newAnswer.filter(o => o.isCorrect);
                onAnswer(question, selectedOptions.length > 0 ? {
                    options: selectedOptions
                } : undefined);
                break;
            case QuestionType.essay:
                onAnswer(question, newAnswer ? {
                    content: newAnswer
                } : undefined);
                break;
            case QuestionType.code:
                onAnswer(question, newAnswer);
                break;
            case QuestionType.web:
                onAnswer(question, newAnswer);
                break;
            default:
                break;
        }
    }, [answer, onAnswer]);

    useEffect(() => {
        if(question){
            // prepare the answer data for the AnswerEditor
            let answerData = {
                type: question.type,
            };

            switch(question.type){
                case QuestionType.trueFalse:
                    let isTrue = undefined;
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        isTrue = question.studentAnswer[0].trueFalse.isTrue;
                    }
                    answerData.isTrue = isTrue;
                    break;
                case QuestionType.multipleChoice:

                    let allOptions = question.multipleChoice.options;
                    let studentOptions = [];
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        studentOptions = question.studentAnswer[0].multipleChoice.options;
                    }

                    answerData.options = allOptions.map(option => {
                        return {
                            ...option,
                            isCorrect: studentOptions && studentOptions.some(studentOption => studentOption.id === option.id)
                        }
                    });
                    break;
                case QuestionType.essay:
                    let content = "";
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        content = question.studentAnswer[0].essay.content;
                    }
                    answerData.content = content;
                    break;
                case QuestionType.code:
                    let files = question.code.templateFiles;
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        files = question.studentAnswer[0].code.files;
                    }
                    answerData = {
                        ...answerData,
                        question: question.code, // for language, sandbox, testCases
                        files   // files to be edited by student
                    };

                    break;
                case QuestionType.web:
                    let web = question.web;
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        web = question.studentAnswer[0].web;
                    }
                    answerData.web = web;
                    break;

            }
            setAnswer(answerData);
        }
    }, [question]);

    return (
        answer && (
            answer.type === QuestionType.trueFalse && (
                <TrueFalse
                    id={`answer-editor-${question.id}`}
                    allowUndefined={true}
                    isTrue={answer.isTrue}
                    onChange={onAnswerByType}
                />
            )
            ||
            answer.type === QuestionType.multipleChoice && answer.options && (
                <MultipleChoice
                    id={`answer-editor-${question.id}`}
                    selectOnly
                    options={answer.options}
                    onChange={onAnswerByType}
                />
            )
            ||
            answer.type === QuestionType.essay && (
                <Essay
                    id={`answer-editor-${question.id}`}
                    content={answer.content}
                    onChange={onAnswerByType}
                />
            )
            ||
            answer.type === QuestionType.code && (
                <AnswerCode
                    question={question}
                />
            )
            ||
            answer.type === QuestionType.web && (
                <Web
                    id={`answer-editor-${question.id}`}
                    web={answer.web}
                    onChange={onAnswerByType}
                />
            )
        )
    )
}

const update = async (question, file) =>
    await fetch(`/api/answer/${question.id}/code/${file.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({file})
    }).then((res) => res.json());


const AnswerCode  = ({ question }) => {

    console.log("question", question)

    const { showTopRight: showSnackbar } = useSnackbar();

    const { data:answer, mutate } = useSWR(
        `/api/answer/${question?.id}`,
        question.id ? (...args) => fetch(...args).then((res) => res.json()) : null,
    );

   const onFileChange = useCallback(async (file) => {
       await update(question, file).then(async () => {
           await mutate();
           //showSnackbar('Answer submitted successfully', 'success');
       });
    }, [question, mutate]);

    return (
        answer && answer.code && (
            <Stack position="relative" height="100%">
                <Box height="100%" overflow="auto" pb={16}>
                    { answer.code.files?.map((answerToFile, index) => (
                        <FileEditor
                            key={index}
                            file={answerToFile.file}
                            readonlyPath
                            onChange={onFileChange}

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

export default AnswerEditor;
