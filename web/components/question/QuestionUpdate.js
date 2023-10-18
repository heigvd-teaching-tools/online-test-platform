import useSWR from 'swr'
import { useCallback } from 'react'
import Image from 'next/image'
import { Stack, TextField, Button, Box, Tooltip } from '@mui/material'
import ContentEditor from '../input/ContentEditor'

import LayoutSplitScreen from '../layout/LayoutSplitScreen'
import QuestionTypeSpecific from './QuestionTypeSpecific'
import { useDebouncedCallback } from 'use-debounce'

import { useSnackbar } from '../../context/SnackbarContext'

import QuestionTagsSelector from './tags/QuestionTagsSelector'
import { useRouter } from 'next/router'
import Loading from '../feedback/Loading'
import { fetcher } from '../../code/utils'
import ScrollContainer from '../layout/ScrollContainer'
import DecimalInput from '../input/DecimalInput'

const QuestionUpdate = ({ questionId }) => {
  const router = useRouter()
  const { show: showSnackbar } = useSnackbar()

  const {
    data: question,
    mutate,
    error,
  } = useSWR(`/api/questions/${questionId}`, questionId ? fetcher : null, {
    revalidateOnFocus: false,
  })

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
        .then(async (_) => {
          showSnackbar('Question saved', 'success')
        })
        .catch(() => {
          showSnackbar('Error saving questions', 'error')
        })
    },
    [showSnackbar]
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
        showSnackbar('Question deleted', 'success')
        await router.push('/questions')
      })
      .catch(() => {
        showSnackbar('Error deleting question', 'error')
      })
  }, [question, showSnackbar, router, mutate])

  const onChange = useCallback(
    async (question) => {
      await saveQuestion(question)
    },
    [saveQuestion]
  )

  const debounceChange = useDebouncedCallback(
    useCallback(async () => {
      await onChange(question)
    }, [question, onChange]),
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
            <Stack spacing={2} sx={{ pl: 2, pt: 3, pb: 2, height: '100%' }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <TextField
                  id={`question-${question.id}-title`}
                  label="Title"
                  variant="outlined"
                  fullWidth
                  focused
                  defaultValue={question.title}
                  onChange={(e) => onPropertyChange('title', e.target.value)}
                />
                <Tooltip title={"A default amount of points that will pre-fill points field in a collection"}>
                  <DecimalInput
                    label={'Default pts'}
                    value={question.defaultPoints}
                    variant="outlined"
                    onChange={(value) => onPropertyChange('defaultPoints', value)}
                  />
                </Tooltip>
              </Stack>
              <QuestionTagsSelector questionId={question.id} />
              <ScrollContainer>
                <Box>
                  <ContentEditor
                    id={`question-${question.id}`}
                    language="markdown"
                    rawContent={question.content}
                    onChange={(content) => onPropertyChange('content', content)}
                  />
                </Box>
              </ScrollContainer>

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
                  onClick={() => deleteQuestion(question.id)}
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
    </Loading>
  )
}

export default QuestionUpdate
