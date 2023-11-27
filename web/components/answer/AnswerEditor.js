import React, {useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { QuestionType, StudentAnswerStatus } from '@prisma/client'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/router'
import { Button, Stack, Typography } from '@mui/material'
import { fetcher } from '@/code/utils'

import TrueFalse from '@/components/question/type_specific/TrueFalse'
import MultipleChoice from '@/components/question/type_specific/MultipleChoice'
import Essay from '@/components/question/type_specific/Essay'
import Loading from '@/components/feedback/Loading'
import WebEditor from '@/components/question/type_specific/web/WebEditor'
import ResizePanel from '@/components/layout/utils/ResizePanel'
import PreviewPanel from '@/components/question/type_specific/web/PreviewPanel'
import ScrollContainer from '@/components//layout/ScrollContainer'
import AnswerDatabase from "./database/AnswerDatabase";
import AnswerCode from "./code/AnswerCode";
import AlertFeedback from '../feedback/AlertFeedback'
import { LoadingButton } from '@mui/lab'

const SubmittedOverlay = ({ onUnsubmit }) => {
  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(255,255,255,0.5)',
        zIndex: 100,
      }}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Stack spacing={2} alignItems={'center'}>
        <AlertFeedback
            severity={'success'}
          >
            <Typography variant={'body1'}>Your answer top this question has been submitted</Typography>
            <Typography variant={'body2'}>You can unsubmit your answer if you want to make changes</Typography>

          </AlertFeedback>
          
          <Button onClick={onUnsubmit} variant={'text'}>
            Unsubmit
          </Button>
            
      </Stack>
        
    </Stack>
  )
}
     
const AnswerEditor = ({ status:initial, question, onAnswer, onSubmit, onUnsubmit }) => {
  const router = useRouter()
  const { evaluationId } = router.query

  const { data: answer, error, mutate } = useSWR(
    `/api/users/evaluations/${evaluationId}/questions/${question.id}/answers`,
    evaluationId && question ? fetcher : null,
      { revalidateOnFocus: false }
  )

  const [ status, setStatus ] = useState(initial)

  useEffect(() => setStatus(initial), [initial])

  useEffect(() => {
    setStatus(answer?.status)
  }, [answer])

  const [ submitLock, setSubmitLock ] = useState(false)

  const onAnswerChange = useCallback(
    (updatedStudentAnswer) => {
      setStatus(updatedStudentAnswer.status)
      if (onAnswer) {
        onAnswer(question, updatedStudentAnswer)
      }
    },
    [question, onAnswer]
  )

  const onSubmitClick = useCallback(async () => {
    setSubmitLock(true)
    await fetch(`/api/users/evaluations/${evaluationId}/questions/${question.id}/answers/submit`, {
      method: 'PUT',
    })
    .finally(async () => {
      setStatus(StudentAnswerStatus.SUBMITTED)
      onSubmit && onSubmit(question)
      await mutate()
    })
    setSubmitLock(false)
  }, [onSubmit, question])

  const onUnsubmitClick = useCallback(() => {
    setSubmitLock(true)
    fetch(`/api/users/evaluations/${evaluationId}/questions/${question.id}/answers/submit`, {
      method: 'DELETE',
    })
    .finally(async () => {
      setStatus(StudentAnswerStatus.IN_PROGRESS)
      onUnsubmit && onUnsubmit(question)
      await mutate()
    })
    setSubmitLock(false)
  }, [onUnsubmit, question])


  const isReadOnly = status === StudentAnswerStatus.SUBMITTED

  return (
    <Loading errors={[error]} loading={!answer}>
     <Stack height={"100%"} position={"relative"}>
      {isReadOnly && <SubmittedOverlay onUnsubmit={() => onUnsubmitClick()} />}
        {question &&
        ((question.type === QuestionType.trueFalse && (
          <AnswerTrueFalse
            answer={answer}
            evaluationId={evaluationId}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
          />
        )) ||
          (question.type === QuestionType.multipleChoice && (
            <AnswerMultipleChoice
              answer={answer}
              evaluationId={evaluationId}
              questionId={question.id}
              onAnswerChange={onAnswerChange}
            />
          )) ||
          (question.type === QuestionType.essay && (
            <AnswerEssay
              answer={answer}
              evaluationId={evaluationId}
              questionId={question.id}
              onAnswerChange={onAnswerChange}
            />
          )) ||
          (question.type === QuestionType.code && (
            <AnswerCode
              evaluationId={evaluationId}
              questionId={question.id}
              onAnswerChange={onAnswerChange}
            />
          )) ||
          (question.type === QuestionType.web && (
            <AnswerWeb
              answer={answer}
              evaluationId={evaluationId}
              questionId={question.id}
              onAnswerChange={onAnswerChange}
            />
          ))) ||
        (question.type === QuestionType.database && (
            <AnswerDatabase
                answer={answer}
                evaluationId={evaluationId}
                questionId={question.id}
                onAnswerChange={onAnswerChange}
            />
            ))
      }
      <SubmissionToolbar 
        lock={submitLock}
        status={status}
        onSubmit={onSubmitClick}
        onUnsubmit={onUnsubmitClick}
      />
    </Stack> 
    </Loading>
    )
}

const SubmissionToolbar = ({ lock, status, onSubmit, onUnsubmit }) => {

  return (
    status !== StudentAnswerStatus.MISSING && (
    <Stack position={"absolute"} bottom={0} right={0} mb={2} mr={1} zIndex={200}>
      {status ===  StudentAnswerStatus.SUBMITTED ? (
        <LoadingButton 
          loading={lock}
          onClick={onUnsubmit} 
          variant={"contained"} 
          size='small'
        >
          Unsubmit
        </LoadingButton>
      ) : (
        <LoadingButton 
          loading={lock}
          onClick={onSubmit} 
          variant={"contained"} 
          color={"info"}
          size='small'
        >
          Submit
        </LoadingButton>
      )}
    </Stack>
    )
  )
};

const AnswerMultipleChoice = ({ answer, evaluationId, questionId, onAnswerChange }) => {

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
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers/multi-choice/options`,
        {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option: changedOption }),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [evaluationId, questionId, onAnswerChange]
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

const AnswerTrueFalse = ({ answer, evaluationId, questionId, onAnswerChange }) => {

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
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [evaluationId, questionId, onAnswerChange]
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

const AnswerEssay = ({ answer, evaluationId, questionId, onAnswerChange }) => {

  const onEssayChange = useCallback(
    async (content) => {
      if (answer.essay.content === content) return
      const updatedStudentAnswer = await fetch(
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers`,
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
    [evaluationId, questionId, answer, onAnswerChange]
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

const AnswerWeb = ({ answer, evaluationId, questionId, onAnswerChange }) => {

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
        `/api/users/evaluations/${evaluationId}/questions/${questionId}/answers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        }
      ).then((res) => res.json())
      onAnswerChange && onAnswerChange(updatedStudentAnswer)
    },
    [evaluationId, questionId, onAnswerChange]
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
