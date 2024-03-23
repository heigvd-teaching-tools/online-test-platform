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
import { useCallback } from 'react'
import Image from 'next/image'
import { useDebouncedCallback } from 'use-debounce'
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

import DragHandleSVG from '@/components/layout/utils/DragHandleSVG'
import DecimalInput from '@/components/input/DecimalInput'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'

const CollectionToQuestion = ({
  groupScope,
  collectionToQuestion,
  onChange,
  onDelete,
}) => {
  const deleteCollectionToQuestion = useCallback(
    async (toDelete) => {
      // delete collectionToQuestion
      // mutate collection
      await fetch(
        `/api/${groupScope}/collections/${toDelete.collectionId}/questions`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: toDelete.questionId,
          }),
        },
      )
    },
    [groupScope],
  )

  const saveCollectionToQuestion = useCallback(
    async (index, updated) => {
      // save collectionToQuestion
      const response = await fetch(
        `/api/${groupScope}/collections/${updated.collectionId}/questions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionToQuestion: updated,
          }),
        },
      )
      if (response.ok) {
        onChange && onChange(index, updated)
      }
    },
    [groupScope, onChange],
  )

  const debounceSaveCollectionToQuestion = useDebouncedCallback(
    saveCollectionToQuestion,
    300,
  )

  // display question icon, title, assign points and remove buttons
  return (
    <Paper variant={'outlined'}>
      <Stack direction="row" alignItems="center" spacing={1} pr={1}>
        <Stack
          justifyContent={'center'}
          sx={{ cursor: 'move' }}
          pt={3}
          pb={3}
          pl={2}
          pr={1}
        >
          <DragHandleSVG />
        </Stack>
        <QuestionTypeIcon type={collectionToQuestion.question.type} />
        <Stack
          direction={'row'}
          alignItems={'center'}
          spacing={1}
          flexGrow={1}
          overflow={'hidden'}
          whiteSpace={'nowrap'}
        >
          <Typography variant="body1">
            <b>Q{collectionToQuestion.order + 1}</b>
          </Typography>
          <Typography variant="body2">
            {collectionToQuestion.question.title}
          </Typography>
        </Stack>

        <Box minWidth={70} width={70}>
          <DecimalInput
            value={collectionToQuestion.points}
            variant="standard"
            rightAdornement={'pts'}
            onChange={async (value) => {
              await debounceSaveCollectionToQuestion(
                collectionToQuestion.order,
                {
                  ...collectionToQuestion,
                  points: value,
                },
              )
            }}
          />
        </Box>
        <Tooltip title="Remove from collection">
          <IconButton
            key="delete-collection"
            onClick={async (ev) => {
              ev.preventDefault()
              ev.stopPropagation()
              await deleteCollectionToQuestion(collectionToQuestion)
              onDelete && onDelete()
            }}
          >
            <Image
              alt="Remove From Collection"
              src="/svg/icons/cross.svg"
              width="24"
              height="24"
            />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  )
}

export default CollectionToQuestion
