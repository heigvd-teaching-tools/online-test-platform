import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Role } from '@prisma/client'

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useDebouncedCallback } from 'use-debounce'
import AddIcon from '@mui/icons-material/Add'

import { fetcher } from '@/code/utils'

import Authorisation from '@/components/security/Authorisation'

import LayoutMain from '@/components/layout/LayoutMain'
import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import ReorderableList from '@/components/layout/utils/ReorderableList'
import ScrollContainer from '@/components/layout/ScrollContainer'
import BackButton from '@/components/layout/BackButton'
import Loading from '@/components/feedback/Loading'

import QuestionFilter from '@/components/question/QuestionFilter'
import QuestionListItem from '@/components/questions/list/QuestionListItem'

import CollectionToQuestion from '../compose/CollectionToQuestion'

const PageCompose = () => {
  const router = useRouter()

  const { groupScope, collectionId } = router.query

  const [queryString, setQueryString] = useState(undefined)

  const {
    data: searchQuestions,
    error: errorSearch,
    mutate: mutateSearch,
  } = useSWR(
    `/api/${groupScope}/questions${
      queryString ? `?${new URLSearchParams(queryString).toString()}` : ''
    }`,
      groupScope ? fetcher : null
  )

  const {
    data: collection,
    error: errorCollection,
    mutate: mutateCollection,
  } = useSWR(
    `/api/${groupScope}/collections/${collectionId}`,
      groupScope && collectionId ? fetcher : null
  )

  const [label, setLabel] = useState('')
  const [collectionToQuestions, setCollectionToQuestions] = useState([])

  useEffect(() => {
    if (collection) {
      setLabel(collection.label)
      setCollectionToQuestions(collection.collectionToQuestions)
    }
  }, [collection])

  const addCollectionToQuestion = useCallback(
    async (question) => {
      // add question to collection
      // mutate collection
      const response = await fetch(
        `/api/${groupScope}/collections/${collectionId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: question.id
          }),
        }
      )
      if (response.ok) {
        await mutateCollection()
      }
    },
    [groupScope, collectionId, mutateCollection]
  )

  const saveReOrder = useCallback(async () => {
    // save question order
    const response = await fetch(
      `/api/${groupScope}/collections/${collectionId}/order`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionToQuestions: collectionToQuestions,
        }),
      }
    )
    if (response.ok) {
      await mutateCollection()
    }
  }, [groupScope, collectionToQuestions, collectionId, mutateCollection])

  const saveCollection = useCallback(
    async (updated) => {
      // save collection
      await fetch(`/api/${groupScope}/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: updated,
        }),
      })
    },
    [groupScope, collectionId]
  )

  const debounceSaveOrdering = useDebouncedCallback(saveReOrder, 300)
  const debounceSaveCollection = useDebouncedCallback(saveCollection, 300)

  const onChangeCollectionOrder = useCallback(
    async (sourceIndex, targetIndex) => {
      const reordered = [...collectionToQuestions]
      const moved = reordered[sourceIndex]
      moved.order = targetIndex
      reordered[targetIndex].order = sourceIndex
      reordered[sourceIndex] = reordered[targetIndex]
      reordered[targetIndex] = moved
      setCollectionToQuestions(reordered)
      await debounceSaveOrdering()
    },
    [collectionToQuestions, setCollectionToQuestions, debounceSaveOrdering]
  )

  const onCollectionToQuestionChange = useCallback(
    async (index, collectionToQuestion) => {
      collectionToQuestions[index] = collectionToQuestion
    },
    [collectionToQuestions]
  )

  const onDeleteCollectionToQuestion = useCallback(
    async (index) => {
      const updated = [...collectionToQuestions]
      updated.splice(index, 1)
      await mutateCollection(updated)
    },
    [collectionToQuestions, mutateCollection]
  )

  
  /* ORDERING DEBUG
  
    const arrayOfOrders = collectionToQuestions?.map(
      (collectionToQuestion) => collectionToQuestion.order
    )
    
    const isIncreasing = (arr = [])  => {
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] <= arr[i - 1]) return false
      }
      return true
    }

    console.log(arrayOfOrders?.join(','), isIncreasing(arrayOfOrders))

  */

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading
        errors={[errorSearch, errorCollection]}
        loading={!searchQuestions || !collection}
      >
        <LayoutMain
          hideLogo
          header={
            <BackButton
              backUrl={`/${groupScope}/collections`}
            />
          }
        >
          <LayoutSplitScreen
            leftPanel={
              collection && (
                <Stack height={"100%"} p={1} pt={4}>
                  <TextField
                    label="Collection Label"
                    variant="outlined"
                    fullWidth
                    value={label}
                    onChange={async (ev) => {
                      setLabel(ev.target.value)
                      const updated = { ...collection }
                      updated.label = ev.target.value
                      await debounceSaveCollection(updated)
                    }}
                  />
                  <Stack mt={2} flex={1}>

                  <ScrollContainer spacing={2} padding={1} pb={24}>
                  <ReorderableList onChangeOrder={onChangeCollectionOrder}>
                    {collectionToQuestions &&
                      collectionToQuestions.map(
                        (collectionToQuestion) => (
                          <CollectionToQuestion
                            groupScope={groupScope}
                            key={collectionToQuestion.question.id}
                            collectionToQuestion={collectionToQuestion}
                            onChange={(index, updates) =>
                              onCollectionToQuestionChange(index, updates)
                            }
                            onDelete={(index) =>
                              onDeleteCollectionToQuestion(index)
                            }
                          />
                        )
                      )}
                  </ReorderableList>
                  </ScrollContainer>
                  </Stack>
                </Stack>
              )
            }
            rightPanel={
              <Stack direction={'row'} height="100%">
                <Box minWidth={'250px'}>
                  <QuestionFilter onApplyFilter={setQueryString} />
                </Box>
                {collectionToQuestions && searchQuestions && (
                  <Stack spacing={2} padding={2} width={'100%'}>
                    <Stack
                      alignItems="center"
                      direction={'row'}
                      justifyContent={'space-between'}
                    >
                      <Typography variant="h6">Available questions</Typography>
                    </Stack>

                    <ScrollContainer spacing={4} padding={1} pb={12}>
                      {searchQuestions
                        .filter(
                          (question) =>
                            !collectionToQuestions.find(
                              (collectionToQuestion) =>
                                collectionToQuestion.question.id === question.id
                            )
                        )
                        .map((question) => (
                          <QuestionListItem
                            key={question.id}
                            question={question}
                            actions={[
                              <Button
                                key={'add'}
                                startIcon={<AddIcon />}
                                onClick={async () =>
                                  await addCollectionToQuestion(question)
                                }
                              >
                                Add to collection
                              </Button>,
                            ]}
                          />
                        ))}
                    </ScrollContainer>
                  </Stack>
                )}
              </Stack>
            }
          />
        </LayoutMain>
      </Loading>
    </Authorisation>
  )
}
export default PageCompose
