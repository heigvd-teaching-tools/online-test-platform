import { QuestionType } from '@prisma/client'
import ManageMultipleChoice from './type_specific/ManageMultipleChoice'
import Code from './type_specific/Code'
import TrueFalse from './type_specific/TrueFalse'
import Web from './type_specific/Web'
import Database from "./type_specific/Database";
import Essay from './type_specific/Essay'
import ScrollContainer from '../layout/ScrollContainer'

const QuestionTypeSpecific = ({ question, onTypeSpecificChange }) => {

  const renderSpecificType = () => {
    switch (question.type) {
      case QuestionType.multipleChoice:
        return (
          <ManageMultipleChoice
              questionId={question.id}
          />
        );

      case QuestionType.code:
        return (
            <Code
                questionId={question.id}
            />
        );

      case QuestionType.database:
        return (
            <Database
              questionId={question.id}
            />
        );

      case QuestionType.trueFalse:
        if (question.trueFalse) {
          return (
              <TrueFalse
                  isTrue={question.trueFalse.isTrue}
                  onChange={(newIsTrue) =>
                      onTypeSpecificChange(question.type, { isTrue: newIsTrue })
                  }
              />
          );
        }
        break;

      case QuestionType.web:
        if (question.web) {
          return (
              <Web
                  web={question.web}
                  onChange={(newWeb) => onTypeSpecificChange(question.type, newWeb)}
              />
          );
        }
        break;
        case QuestionType.essay:
          if (question.essay) {
            return (
                <Essay
                  title={"Solution Answer"}
                  content={question.essay.solution}
                  onChange={(newContent) =>
                      onTypeSpecificChange(question.type, { solution: newContent })
                  }
                />
            );
        }
      default:
        return null; // or a default component or some feedback to the user
    }
  };

  return <ScrollContainer>{renderSpecificType()}</ScrollContainer>;
}

export default QuestionTypeSpecific;

