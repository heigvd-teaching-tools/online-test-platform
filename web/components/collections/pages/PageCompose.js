/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { QuestionType, Role } from '@prisma/client'

import Image from 'next/image'

import {
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { useDebouncedCallback } from 'use-debounce'
import AddIcon from '@mui/icons-material/Add'

import { fetcher } from '@/code/utils'

import Authorization from '@/components/security/Authorization'

import LayoutMain from '@/components/layout/LayoutMain'
import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'
import ReorderableList from '@/components/layout/utils/ReorderableList'
import ScrollContainer from '@/components/layout/ScrollContainer'
import BackButton from '@/components/layout/BackButton'
import Loading from '@/components/feedback/Loading'

import QuestionFilter from '@/components/question/QuestionFilter'

import CollectionToQuestion from '../compose/CollectionToQuestion'
import GridGrouping from '@/components/ui/GridGrouping'
import { weeksAgo } from '@/components/questions/list/utils'
import { getTextByType } from '@/components/question/types'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import QuestionTagsViewer from '@/components/question/tags/QuestionTagsViewer'
import DateTimeAgo from '@/components/feedback/DateTimeAgo'
import CodeQuestionTypeIcon from '@/components/question/type_specific/code/CodeQuestionTypeIcon'
import LanguageIcon from '@/components/question/type_specific/code/LanguageIcon'

const PageCompose = () => {
  const router = useRouter()

  const { groupScope, collectionId } = router.query

  const [queryString, setQueryString] = useState('')

  const { data: searchQuestions, error: errorSearch } = useSWR(
    `/api/${groupScope}/questions?${queryString}`,
    groupScope ? fetcher : null,
  )

  const { data: collection, error: errorCollection } = useSWR(
    `/api/${groupScope}/collections/${collectionId}`,
    groupScope && collectionId ? fetcher : null,
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
      await fetch(`/api/${groupScope}/collections/${collectionId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
        }),
      })
        .then((res) => res.json())
        .then(async (createdCollectionToQuestion) => {
          setCollectionToQuestions([
            ...collectionToQuestions,
            createdCollectionToQuestion,
          ])
        })
    },
    [groupScope, collectionId, collectionToQuestions],
  )

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
    [groupScope, collectionId],
  )

  const saveReOrder = useCallback(
    async (reordered) => {
      // save question order
      await fetch(`/api/${groupScope}/collections/${collectionId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionToQuestions: reordered,
        }),
      })
    },
    [groupScope, collectionId],
  )

  const debounceSaveOrdering = useDebouncedCallback(saveReOrder, 300)
  const debounceSaveCollection = useDebouncedCallback(saveCollection, 300)

  const onChangeCollectionOrder = useCallback(
    async (sourceIndex, targetIndex) => {
      
      const reordered = [...collectionToQuestions]

      // Remove the element from its original position
      const [removedElement] = reordered.splice(sourceIndex, 1)

      // Insert the element at the target position
      reordered.splice(targetIndex, 0, removedElement)

      // Update the order properties for all elements
      reordered.forEach((item, index) => {
        item.order = index
      })

      setCollectionToQuestions(reordered)
      await debounceSaveOrdering(reordered)
    },
    [collectionToQuestions, setCollectionToQuestions, debounceSaveOrdering],
  )

  const onDeleteCollectionToQuestion = useCallback(
    async (index) => {
      const updated = [...collectionToQuestions]
      updated.splice(index, 1)
      setCollectionToQuestions(
        updated.map((collectionToQuestion, index) => ({
          ...collectionToQuestion,
          order: index,
        })),
      )
    },
    [collectionToQuestions, setCollectionToQuestions],
  )

  return (
    <Authorization allowRoles={[Role.PROFESSOR]}>
      <Loading
        errors={[errorSearch, errorCollection]}
        loading={!searchQuestions || !collection}
      >
        <LayoutMain
          hideLogo
          header={<BackButton backUrl={`/${groupScope}/collections`} />}
        >
          <LayoutSplitScreen
            leftPanel={
              collection && (
                <Stack height={'100%'} p={1} pt={4}>
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
                            (collectionToQuestion, index) => (
                              <CollectionToQuestion
                                groupScope={groupScope}
                                key={collectionToQuestion.question.id}
                                collectionToQuestion={collectionToQuestion}
                                onDelete={() =>
                                  onDeleteCollectionToQuestion(index)
                                }
                              />
                            ),
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
                  <QuestionFilter
                    filters={queryString}
                    onApplyFilter={setQueryString}
                  />
                </Box>
                {collectionToQuestions && searchQuestions && (
                  <Stack spacing={2} padding={2} width={'100%'}>
                    <QuestionsGrid
                      questions={searchQuestions.filter(
                        (question) =>
                          !collectionToQuestions.find(
                            (collectionToQuestion) =>
                              collectionToQuestion.question.id === question.id,
                          ),
                      )}
                      addCollectionToQuestion={addCollectionToQuestion}
                    />
                  </Stack>
                )}
              </Stack>
            }
          />
        </LayoutMain>
      </Loading>
    </Authorization>
  )
}

const QuestionsGrid = ({ questions, addCollectionToQuestion }) => {
  return (
    <GridGrouping
      label="Available Questions"
      header={{
        columns: [
          {
            label: '',
            column: { width: '40px' },
            renderCell: (row) => {
              return (
                <Tooltip title="Add to collection">
                  <IconButton
                    key={'add'}
                    onClick={async () => await addCollectionToQuestion(row)}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )
            },
          },
          {
            label: 'Type',
            column: { width: '140px' },
            renderCell: (row) => {
              if (row.type === QuestionType.code) {
                return (
                  <Stack direction={'row'} spacing={1} alignItems={'center'}>
                    <QuestionTypeIcon type={row.type} size={24} />
                    <CodeQuestionTypeIcon
                      codeType={row.code?.codeType}
                      size={18}
                    />
                    <LanguageIcon language={row.code?.language} size={18} />
                  </Stack>
                )
              } else {
                return <QuestionTypeIcon type={row.type} size={24} withLabel />
              }
            },
          },
          {
            label: 'Title',
            column: { flexGrow: 1 },
            renderCell: (row) => (
              <Typography variant={'body2'}>{row.title}</Typography>
            ),
          },
          {
            label: 'Tags',
            column: { width: '200px' },
            renderCell: (row) => (
              <QuestionTagsViewer
                size={'small'}
                tags={row.questionToTag}
                collapseAfter={2}
              />
            ),
          },
          {
            label: 'Updated',
            column: { width: '90px' },
            renderCell: (row) => <DateTimeAgo date={new Date(row.updatedAt)} />,
          },
        ],
      }}
      items={questions.map((question) => ({
        ...question,
        meta: {
          key: question.id,
          actions: [
            <React.Fragment key="actions">
              <Tooltip title="Update in new page">
                <IconButton
                  onClick={async () => {
                    await router.push(`/${groupScope}/questions/${question.id}`)
                  }}
                >
                  <Image
                    src={'/svg/icons/update.svg'}
                    width={16}
                    height={16}
                    alt={'Update'}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Update in overlay">
                <IconButton onClick={() => setSelected(question)}>
                  <Image
                    src={'/svg/icons/aside.svg'}
                    width={16}
                    height={16}
                    alt={'Update'}
                  />
                </IconButton>
              </Tooltip>
            </React.Fragment>,
          ],
        },
      }))}
      groupings={[
        {
          groupBy: 'updatedAt',
          option: 'Last Update',
          type: 'date',
          renderLabel: (row) => weeksAgo(row.label),
        },
        {
          groupBy: 'questionToTag',
          option: 'Tags',
          type: 'array',
          property: 'label',
          renderLabel: (row) => row.label,
        },
        {
          groupBy: 'type',
          option: 'Question Type',
          type: 'element',
          renderLabel: (row) => getTextByType(row.label),
        },
      ]}
    />
  )
}

export default PageCompose
