import { useState, useEffect, useRef } from 'react';

import { Paper } from "@mui/material";

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';

const AnswerEditor = ({ question, onAnswer }) => {
    const container = useRef();
    const [ answer, setAnswer ] = useState(undefined);
    const [ height, setHeight ] = useState(0);

    const resizeObserver = useRef(new ResizeObserver(entries => {
        const { height } = entries[0].contentRect;
        setHeight(height);
    }));
    
    const onAnswerByType = (newAnswer) => {
        /* 
            decide the answer submit or delete condition on per type basis
            answer "undefined" means delete
        */
        switch(answer.type) {
            case 'trueFalse':
                onAnswer(newAnswer);
                break;
            case 'multipleChoice':
                let selectedOptions = newAnswer.filter(o => o.isCorrect);
                
                onAnswer(selectedOptions.length > 0 ? {
                    options: selectedOptions
                } : undefined);
                break;
            case 'essay':
                onAnswer(newAnswer);
                break;
            case 'code':
                onAnswer(newAnswer);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if(question){
            
            var answerData = {
                type: question.type,
            };

            switch(question.type){
                case 'trueFalse':
                    answerData.isTrue = question.studentAnswer ? question.studentAnswer.trueFalse.isTrue : undefined;
                    break;
                case 'multipleChoice':
                    
                    let allOptions = question.multipleChoice.options;
                    let studentOptions = question.studentAnswer ? question.studentAnswer.multipleChoice.options : [];
                    // studentOptions empty 
                    console.log("AnswerEditor useEffect", question.studentAnswer);
                    answerData.options = allOptions.map(option => {
                        return {
                            ...option,
                            isCorrect: studentOptions && studentOptions.some(studentOption => studentOption.id === option.id)
                        }
                    });
                    break;
                case 'essay':
                    answerData.content = question.studentAnswer && question.studentAnswer.essay ? question.studentAnswer.essay.content : "";
                    break;
                case 'code':

                    if(question.studentAnswer && question.studentAnswer.code){
                        answerData.code = question.studentAnswer.code;
                    }else{
                        answerData.code = question.code;
                    }
                    break;
            }
            setAnswer(answerData);
        }
    }, [question]);

    useEffect(() => {
            var element = container.current;
            var observer = resizeObserver.current;
            observer.observe(element);         

            // Remove event listener on cleanup
            return () => observer.unobserve(element);
      }, [resizeObserver, container]);

    return (
        <Paper ref={container} square elevation={0} sx={{ flex:1, height: '100%', width:'100%', position:'relative', overflow:'hidden', pt:2, pl:2, pb:1 }}>
        {
            answer && (
                answer.type === 'trueFalse' && (
                    <TrueFalse 
                        allowUndefined={true}
                        isTrue={answer.isTrue} 
                        onChange={onAnswerByType} 
                    />
                )
                ||
                answer.type === 'multipleChoice' && answer.options && (
                    <MultipleChoice
                        selectOnly
                        options={answer.options}
                        onChange={onAnswerByType}
                    />
                )
                || 
                answer.type === 'essay' && (
                    <Essay
                        label="Your answer"
                        content={answer.content}
                        onChange={onAnswerByType}
                    />
                )
                ||
                answer.type === 'code' && (
                    <Code
                        mode="partial"
                        code={answer.code}
                        editorHeight={height}
                        onChange={(which, newCode) => {
                            onAnswerByType({
                                [which]: newCode
                            })
                        }}
                    />      
                )       

            )
        }
        </Paper>
    )
}

export default AnswerEditor;