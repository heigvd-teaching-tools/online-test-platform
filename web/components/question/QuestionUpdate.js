import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Stack, TextField, Button, Box, Tooltip, FormControlLabel, Switch, Typography, Alert } from '@mui/material'
import ContentEditor from '../input/ContentEditor'

import LayoutSplitScreen from '../layout/LayoutSplitScreen'
import QuestionTypeSpecific from './QuestionTypeSpecific'
import { useDebouncedCallback } from 'use-debounce'

import { useSnackbar } from '../../context/SnackbarContext'

import QuestionTagsSelector from './tags/QuestionTagsSelector'
import { useRouter } from 'next/router'
import Loading from '../feedback/Loading'
import { fetcher } from '../../code/utils'
import DecimalInput from '../input/DecimalInput'
import DialogFeedback from '../feedback/DialogFeedback'

const QuestionUpdate = ({ questionId, onUpdate, onDelete }) => {
  const router = useRouter()
  const { show: showSnackbar } = useSnackbar()

  const {
    data:question,
    mutate,
    error,
  } = useSWR(`/api/questions/${questionId}`, questionId ? fetcher : null, {
    revalidateOnFocus: false,
  })

  const [ deleteQuestionDialogOpen, setDeleteQuestionDialogOpen ] = useState(false)

  useEffect(() => {
    // if group changes, re-fetch questions
    if (questionId) {
      ;(async () => await mutate())()
    }
  }, [questionId])

  const [ title, setTitle ] = useState("")

  useEffect(() => {
    if (question) {
      setTitle(question.title)
    }
  }, [question])

  const saveQuestion = useCallback(
    async (question) => {
      await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ question }),
      })
        .then((res) => res.json())
        .then(async (question) => {
          onUpdate && onUpdate(question)
          showSnackbar('Question saved', 'success')
        })
        .catch(() => {
          showSnackbar('Error saving questions', 'error')
        })
    },
    [showSnackbar, onUpdate]
  )

  const deleteQuestion = useCallback(async () => {
    await fetch(`/api/questions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then(async () => {
        await mutate()
        onDelete && onDelete(question)
        showSnackbar('Question deleted', 'success')
        await router.push('/questions')
      })
      .catch(() => {
        showSnackbar('Error deleting question', 'error')
      })
  }, [question, showSnackbar, router, mutate, onDelete])

  const onChangeQuestion = useCallback(
    async (question) => {
      await saveQuestion(question)
    },
    [saveQuestion]
  )

  const debounceChange = useDebouncedCallback(
    useCallback(async () => {
      await onChangeQuestion(question)
    }, [question, onChangeQuestion]),
    500
  )

  const onPropertyChange = useCallback(
    async (property, value) => {
      // instantly update the question object in memory
      question[property] = value
      // debounce the change to the api
      await debounceChange()
    },
    [question, debounceChange]
  )

  return (
    <Loading loading={!question} errors={[error]}>
      <LayoutSplitScreen
        leftPanel={
          question && (
            <Stack spacing={2} sx={{ pl: 2, pt: 1, pb: 2, height: '100%' }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <TextField
                  id={`question-${question.id}-title`}
                  label="Title"
                  variant="outlined"
                  fullWidth
                  focused
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    onPropertyChange('title', e.target.value)
                  }}
                />
                <Tooltip title={"A default amount of points that will pre-fill points field in a collection"}>
                  <Box>
                  <DecimalInput
                    label={'Default pts'}
                    value={question.defaultPoints}
                    rightAdornement={'step 0.25'}
                    variant="outlined"
                    onChange={(value) => onPropertyChange('defaultPoints', value)}
                  />
                  </Box>
                </Tooltip>
              </Stack>
              <QuestionTagsSelector 
                questionId={question.id} 
                onChange={() => onUpdate(question)}
              />
              
              <ContentEditor
                id={`question-${question.id}`}
                title="Problem Statement"
                rawContent={question.content}
                readOnly={false}
                onChange={(content) => onPropertyChange('content', content)}
              />

              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ width: '100%' }}
              >
                <Button
                  startIcon={
                    <Image
                      alt="Delete"
                      src="/svg/icons/delete.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                  }
                  onClick={() => setDeleteQuestionDialogOpen(true)}
                >
                  Delete this question
                </Button>
              </Stack>
            </Stack>
          )
        }
        rightPanel={
          question && (
            <QuestionTypeSpecific
              question={question}
              onTypeSpecificChange={(type, value) =>
                onPropertyChange(type, value)
              }
            />
          )
        }
      />
      <DialogFeedback
        open={deleteQuestionDialogOpen}
        title="Delete question"
        content={
            <Typography variant="body1">
              You are about to delete this question. Are you sure?
            </Typography>
        }
        onClose={() => setDeleteQuestionDialogOpen(false)}
        onConfirm={deleteQuestion}
      />
    </Loading>
  )
}

export default QuestionUpdate
