import React, {useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { QuestionType } from '@prisma/client'

import TrueFalse from '../question/type_specific/TrueFalse'
import MultipleChoice from '../question/type_specific/MultipleChoice'
import Essay from '../question/type_specific/Essay'
import Web from '../question/type_specific/Web'

import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/router'
import Loading from '../feedback/Loading'
import { fetcher } from '../../code/utils'
import AnswerDatabase from "./database/AnswerDatabase";
import AnswerCode from "./code/AnswerCode";

const AnswerEditor = ({ question, onAnswer }) => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const onAnswerChange = useCallback(
    (updatedStudentAnswer) => {
      if (onAnswer) {
        onAnswer(question, updatedStudentAnswer)
      }
    },
    [question, onAnswer]
  )
  return (
    question &&
    ((question.type === QuestionType.trueFalse && (
      <AnswerTrueFalse
        jamSessionId={jamSessionId}
        questionId={question.id}
        onAnswerChange={onAnswerChange}
      />
    )) ||
      (question.type === QuestionType.multipleChoice && (
        <AnswerMultipleChoice
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.essay && (
        <AnswerEssay
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.code && (
        <AnswerCode
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
      (question.type === QuestionType.web && (
        <AnswerWeb
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      ))) ||
    (question.type === QuestionType.database && (
        <AnswerDatabase
            jamSessionId={jamSessionId}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
        />
        ))
    )
}



const AnswerMultipleChoice = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    jamSessionId && questionId ? fetcher : null
  )

  const [options, setOptions] = useState(undefined)

  useEffect(() => {
    if (answer?.question.multipleChoice.options && answer) {
      // merge the options with the student answers

      let allOptions = answer.question.multipleChoice.options
      let studentOptions = answer.multipleChoice?.options

      setOptions(
        allOptions.map((option) => {
          return {
            ...option,
            isCorrect:
              studentOptions &&
              studentOptions.some(
                (studentOption) => studentOption.id === option.id
              ),
          }
        })
      )
    }
  }, [answer])

  const onOptionChange = useCallback(
    async (index, options) => {
      const changedOption = options[index]
      const method = changedOption.isCorrect ? 'POST' : 'DELETE'
      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers/multi-choice/options`,
        {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option: changedOption }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.multipleChoice && options && (
        <MultipleChoice
          id={`answer-editor-${questionId}`}
          selectOnly
          options={options}
          onChange={onOptionChange}
        />
      )}
    </Loading>
  )
}

const AnswerTrueFalse = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onTrueFalseChange = useCallback(
    async (isTrue) => {
      const answer = {
        answer:
          isTrue !== undefined
            ? {
                isTrue: isTrue,
              }
            : undefined,
      }

      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.trueFalse && (
        <TrueFalse
          id={`answer-editor-${questionId}`}
          allowUndefined={true}
          isTrue={answer.trueFalse.isTrue}
          onChange={onTrueFalseChange}
        />
      )}
    </Loading>
  )
}

const AnswerEssay = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onEssayChange = useCallback(
    async (content) => {
      if (answer.essay.content === content) return
      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answer: content
              ? {
                  content: content,
                }
              : undefined,
          }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, answer, onAnswerChange]
  )

  const debouncedOnChange = useDebouncedCallback(onEssayChange, 500)

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.essay && (
        <Essay
          id={`answer-editor-${questionId}`}
          content={answer.essay.content}
          onChange={debouncedOnChange}
        />
      )}
    </Loading>
  )
}

const AnswerWeb = ({ jamSessionId, questionId, onAnswerChange }) => {
  const { data: answer, error } = useSWR(
    `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
    questionId ? fetcher : null
  )

  const onWebChange = useCallback(
    async (web) => {
      const isEmptyWeb = !web || (!web.html && !web.css && !web.js)
      const answer = {
        answer: !isEmptyWeb
          ? {
              ...web,
            }
          : undefined,
      }

      const updatedStudentAnswer = await fetch(
        `/api/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [jamSessionId, questionId, onAnswerChange]
  )

  const debouncedOnChange = useDebouncedCallback(onWebChange, 500)

  return (
    <Loading errors={[error]} loading={!answer}>
      {answer?.web && (
        <Web
          id={`answer-editor-${questionId}`}
          web={answer.web}
          onChange={debouncedOnChange}
        />
      )}
    </Loading>
  )
}

export default AnswerEditor
