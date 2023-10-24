import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import DragHandleSVG from '../../layout/utils/DragHandleSVG'
import QuestionTypeIcon from '../../question/QuestionTypeIcon'
import Image from 'next/image'
import DecimalInput from '../../input/DecimalInput'
import UserHelpPopper from '../../feedback/UserHelpPopper'
import DialogHelp from '../../feedback/DialogHelp'

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
    [onChange]
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

        <Box minWidth={120} width={120}>
            <DecimalInput
              label="Points"
              value={collectionToQuestion.points}
              variant="standard"
              size={'small'}
              rightAdornement={'step 1'}
              onChange={async (value) => {
                console.log("value", value)
                await debounceSaveCollectionToQuestion(index, {
                  ...collectionToQuestion,
                  points: value
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
