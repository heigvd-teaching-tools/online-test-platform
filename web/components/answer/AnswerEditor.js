import { useState, useEffect } from 'react';

import TrueFalse from '../question/type_specific/TrueFalse';
import MultipleChoice from '../question/type_specific/MultipleChoice';
import Essay from '../question/type_specific/Essay';
import Code from '../question/type_specific/Code';

const AnswerEditor = ({ question, onAnswer }) => {

    const [ answer, setAnswer ] = useState(undefined);

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
                        answerData.code = question.studentAnswer.code.code;
                    }else{
                        answerData.code = question.code.code;
                    }
                    break;
            }
            setAnswer(answerData);
        }
    }, [question]);

    return (
        <>
        {
            answer && (
                answer.type === 'trueFalse' && (
                    <TrueFalse 
                        allowUndefined={true}
                        isTrue={answer.isTrue} 
                        onChange={onAnswer} 
                    />
                )
                ||
                answer.type === 'multipleChoice' && answer.options && (
                    <MultipleChoice
                        selectOnly
                        options={answer.options}
                        onChange={onAnswer}
                    />
                )
                || 
                answer.type === 'essay' && (
                    <Essay
                        label="Your answer"
                        content={answer.content}
                        onChange={onAnswer}
                    />
                )
                ||
                answer.type === 'code' && (
                    <Code
                        mode="partial"
                        code={answer}
                        onChange={onAnswer}
                    />      
                )       

            )
        }
        </>
    )
}

export default AnswerEditor;