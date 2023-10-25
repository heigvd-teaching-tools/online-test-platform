import { QuestionType } from '@prisma/client'
import { Paper } from '@mui/material'
import CompareCode from './CompareCode'
import ConsultWeb from './ConsultWeb'
import CompareEssay from './CompareEssay'
import CompareMultipleChoice from './CompareMultipleChoice'
import CompareTrueFalse from './CompareTrueFalse'
import { ResizeObserverProvider } from '../../context/ResizeObserverContext'
import CompareDatabase from "./CompareDatabase";


const AnswerCompare = ({ questionType, solution, answer }) => {
  return (
    <Paper
      square
      elevation={0}
      sx={{ flex: 1, height: '100%', overflowX: 'auto', p: 0 }}
    >
      {
        answer &&
          ((questionType === QuestionType.trueFalse && (
            <CompareTrueFalse
              mode="compare"
              solution={solution.isTrue}
              answer={answer.isTrue}
            />
          )) ||
            (questionType === QuestionType.multipleChoice && answer.options && (
              <CompareMultipleChoice
                options={solution.options}
                answer={answer.options}
              />
            )) ||
            (questionType === QuestionType.essay && (
              <CompareEssay solution={solution} answer={answer.content} />
            )) ||
            (questionType === QuestionType.code && (
              <ResizeObserverProvider>
                <CompareCode solution={solution} answer={answer} />
              </ResizeObserverProvider>
            )) ||
            (questionType === QuestionType.web && (
              <ConsultWeb answer={answer} />
            ))) ||
            (questionType === QuestionType.database && (
                <CompareDatabase solution={solution} answer={answer} />
            ))
      }
    </Paper>
  )
}

export default AnswerCompare
