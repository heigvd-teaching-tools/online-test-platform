import {QuestionType} from "@prisma/client";
import ManageMultipleChoice from "./type_specific/ManageMultipleChoice";
import Code from "./type_specific/Code";
import TrueFalse from "./type_specific/TrueFalse";
import Web from "./type_specific/Web";

const QuestionTypeSpecific = ({ question, onTypeSpecificChange }) => {
    return (
        <>
            {(
                ( question.type === QuestionType.multipleChoice &&
                    <ManageMultipleChoice
                        questionId={question.id}
                    />
                )
                ||
                ( question.type === QuestionType.code &&
                    <Code
                        questionId={question.id}
                    />
                )
                ||
                ( question.type === QuestionType.trueFalse && question.trueFalse &&
                    <TrueFalse
                        isTrue={question.trueFalse.isTrue}
                        onChange={(newIsTrue) => onTypeSpecificChange(question.type, { isTrue: newIsTrue })}
                    />
                )
                ||
                ( question.type === QuestionType.web && question.web &&
                    <Web
                        web={question.web}
                        onChange={(newWeb) => onTypeSpecificChange(question.type, newWeb)}
                    />
                )
            )}
        </>
    )
}

export default QuestionTypeSpecific;
