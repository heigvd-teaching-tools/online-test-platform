import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DragHandleSVG from '../../layout/utils/DragHandleSVG'
import QuestionTypeIcon from '../../question/QuestionTypeIcon'
import Image from 'next/image'

const CollectionToQuestion = ({
  collectionToQuestion,
  index,
  onChange,
  onDelete,
}) => {
  const deleteCollectionToQuestion = useCallback(
    async (toDelete) => {
      // delete collectionToQuestion
      // mutate collection
      const response = await fetch(
        `/api/collections/${toDelete.collectionId}/questions`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: toDelete.questionId,
          }),
        }
      )
      if (response.ok) {
        onDelete && onDelete(index)
      }
    },
    [index, onDelete]
  )

  const saveCollectionToQuestion = useCallback(
    async (index, updated) => {
      // save collectionToQuestion
      const response = await fetch(
        `/api/collections/${updated.collectionId}/questions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionToQuestion: updated,
          }),
        }
      )
      if (response.ok) {
        onChange && onChange(index, updated)
      }
    },
    [index, onChange]
  )

  const debounceSaveCollectionToQuestion = useDebouncedCallback(
    saveCollectionToQuestion,
    300
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
            <b>Q{index + 1}</b>
          </Typography>
          <Typography variant="body2">
            {collectionToQuestion.question.title}
          </Typography>
        </Stack>

        <Box minWidth={60} width={60}>
          <TextField
            label="Points"
            type="number"
            width={50}
            size={'small'}
            defaultValue={collectionToQuestion.points}
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={async (ev) => {
              await debounceSaveCollectionToQuestion(index, {
                ...collectionToQuestion,
                points: ev.target.value,
              })
            }}
          />
        </Box>
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
            alt="Delete"
            src="/svg/icons/delete.svg"
            layout="fixed"
            width="18"
            height="18"
          />
        </IconButton>
      </Stack>
    </Paper>
  )
}

export default CollectionToQuestion
