import { useState, useEffect, useRef, useCallback } from 'react';

import { QuestionType, StudentAnswerStatus } from '@prisma/client';

import {Stack} from "@mui/material";

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';
import Web from '../question/type_specific/Web';

const AnswerEditor = ({ question, onAnswer }) => {
    const container = useRef();
    const [ answer, setAnswer ] = useState(undefined);
    const [ height, setHeight ] = useState(0);

    const resizeObserver = useRef(new ResizeObserver(entries => {
        const { height } = entries[0].contentRect;
        setHeight(height);
    }));

    const onAnswerByType = useCallback((newAnswer) => {
        /*
            decide the answer submit or delete condition on per type basis
            answer "undefined" means delete
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

            var answerData = {
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
                    let code = question.code;
                    if(question.studentAnswer[0].status === StudentAnswerStatus.SUBMITTED){
                        code = question.studentAnswer[0].code;
                    }
                    answerData.code = code;
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

    useEffect(() => {
        const element = container.current;
        const observer = resizeObserver.current;
        observer.observe(element);

        // Remove event listener on cleanup
        return () => observer.unobserve(element);
      }, [resizeObserver, container]);

    return (
        <Stack ref={container}>
        {
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
                    <Code
                        id={`answer-editor-${question.id}`}
                        where="answer"
                        mode="partial"
                        code={answer.code}
                        containerHeight={height}
                        questionId={question.id}
                        onChange={(which, newCode) => {
                            onAnswerByType({
                                [which]: newCode
                            })
                        }}

                    />
                )
                ||
                answer.type === QuestionType.web && (
                    <Web
                        id={`answer-editor-${question.id}`}
                        web={answer.web}
                        containerHeight={height}
                        onChange={onAnswerByType}
                    />
                )
            )
        }
        </Stack>
    )
}

export default AnswerEditor;
