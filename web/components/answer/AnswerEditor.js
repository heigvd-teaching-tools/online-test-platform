import React, {useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { QuestionType } from '@prisma/client'

import TrueFalse from '../question/type_specific/TrueFalse'
import MultipleChoice from '../question/type_specific/MultipleChoice'
import Essay from '../question/type_specific/Essay'

import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/router'
import Loading from '../feedback/Loading'
import { fetcher } from '../../code/utils'
import AnswerDatabase from "./database/AnswerDatabase";
import AnswerCode from "./code/AnswerCode";
import WebEditor from '../question/type_specific/web/WebEditor'
import { Stack, Toolbar } from '@mui/material'
import ResizePanel from '../layout/utils/ResizePanel'
import PreviewPanel from '../question/type_specific/web/PreviewPanel'
import ScrollContainer from '../layout/ScrollContainer'

const AnswerEditor = ({ question, onAnswer }) => {
  const router = useRouter()
  const { jamSessionId } = router.query

  const { data: answer, error } = useSWR(
    `/api/users/jam-sessions/${jamSessionId}/questions/${question.id}/answers`,
    jamSessionId && question ? fetcher : null,
      { revalidateOnFocus: false }
  )

  const onAnswerChange = useCallback(
    (updatedStudentAnswer) => {
      if (onAnswer) {
        onAnswer(question, updatedStudentAnswer)
      }
    },
    [question, onAnswer]
  )
  return (
    <Loading errors={[error]} loading={!answer}>
     
      {question &&
      ((question.type === QuestionType.trueFalse && (
        <AnswerTrueFalse
          answer={answer}
          jamSessionId={jamSessionId}
          questionId={question.id}
          onAnswerChange={onAnswerChange}
        />
      )) ||
        (question.type === QuestionType.multipleChoice && (
          <AnswerMultipleChoice
            answer={answer}
            jamSessionId={jamSessionId}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
          />
        )) ||
        (question.type === QuestionType.essay && (
          <AnswerEssay
            answer={answer}
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
            answer={answer}
            jamSessionId={jamSessionId}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
          />
        ))) ||
      (question.type === QuestionType.database && (
          <AnswerDatabase
              answer={answer}
              jamSessionId={jamSessionId}
              questionId={question.id}
              onAnswerChange={onAnswerChange}
          />
          ))
    }</Loading>
    )
}



const AnswerMultipleChoice = ({ answer, jamSessionId, questionId, onAnswerChange }) => {

  const [options, setOptions] = useState(undefined)

  useEffect(() => {
    if (answer?.question.multipleChoice.options && answer) {
      // merge the options with the users answers

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
        `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers/multi-choice/options`,
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
    answer?.multipleChoice && options && (
      <MultipleChoice
        id={`answer-editor-${questionId}`}
        selectOnly
        options={options}
        onChange={onOptionChange}
      />
    )
  )
}

const AnswerTrueFalse = ({ answer, jamSessionId, questionId, onAnswerChange }) => {

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
        `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
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
    answer?.trueFalse && (
        <TrueFalse
          id={`answer-editor-${questionId}`}
          allowUndefined={true}
          isTrue={answer.trueFalse.isTrue}
          onChange={onTrueFalseChange}
        />
      )
  )
}

const AnswerEssay = ({ answer, jamSessionId, questionId, onAnswerChange }) => {

  const onEssayChange = useCallback(
    async (content) => {
      if (answer.essay.content === content) return
      const updatedStudentAnswer = await fetch(
        `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
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
    answer?.essay && (
        <Essay
          id={`answer-editor-${questionId}`}
          title={"Your Answer"}
          content={answer.essay.content}
          onChange={debouncedOnChange}
        />
      )
  )
}

const AnswerWeb = ({ answer, jamSessionId, questionId, onAnswerChange }) => {

  const [ web, setWeb ] = useState(answer?.web)

  useEffect(() => {
    if (answer?.web) {
      setWeb(answer.web)
    }
  }, [answer])

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
        `/api/users/jam-sessions/${jamSessionId}/questions/${questionId}/answers`,
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
    answer?.web && (
        <ResizePanel
          leftPanel={
            <ScrollContainer>
              <Stack spacing={0} pt={0} position={"relative"} pb={24}>
                <WebEditor
                  id={'web-answer-editor'}
                  web={web}
                  onChange={(web) => {
                    setWeb(web)
                    debouncedOnChange(web)
                  }}
                />
              </Stack>
            </ScrollContainer>
          }
          rightPanel={
            <PreviewPanel
              id={`web-preview-${questionId}`}
              web={web}
            />
          }
        />

      )
  )
}

export default AnswerEditor
