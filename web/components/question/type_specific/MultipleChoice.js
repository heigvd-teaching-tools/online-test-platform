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
import { useCallback, useEffect, useState } from 'react'
import {
  Stack,
  TextField,
  IconButton,
  ToggleButton,
  Button,
  Typography,
  Box,
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import DragHandleSVG from '@/components/layout/utils/DragHandleSVG'
import ReorderableList from '@/components/layout/utils/ReorderableList'

const MultipleChoice = ({
  id = 'multi_choice',
  options: initial,
  onChange,
  onChangeOrder,
  onAdd,
  onDelete,
  selectOnly = false,
}) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (initial) {
      if (initial && initial.length > 0) {
        setOptions(initial)
      }
    }
  }, [initial, id])

  const selectOption = (index) => {
    const newOptions = [...options]
    newOptions[index].isCorrect = !newOptions[index].isCorrect
    // must have at least one selected option
    if (!selectOnly && !newOptions.some((option) => option.isCorrect)) {
      return
    }
    setOptions(newOptions)
    onChange(index, newOptions)
  }

  const onReorder = useCallback(
    async (sourceIndex, targetIndex) => {
      const reordered = [...options]

      // Remove the element from its original position
      const [removedElement] = reordered.splice(sourceIndex, 1)

      // Insert the element at the target position
      reordered.splice(targetIndex, 0, removedElement)

      // Update the order properties for all elements
      reordered.forEach((item, index) => {
        item.order = index
      })

      setOptions(reordered)
      onChangeOrder(reordered)
    },
    [options, onChangeOrder],
  )

  return (
    <Stack id={id} direction="column" spacing={2} padding={2}>
      {!selectOnly && (
        <Box>
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => onAdd()}
          >
            Add Option
          </Button>
        </Box>
      )}
      <ReorderableList onChangeOrder={onReorder}>
        {options?.map((option, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flex: 1 }}
          >
            {!selectOnly && (
              <Stack justifyContent={'center'} sx={{ cursor: 'move' }}>
                <DragHandleSVG />
              </Stack>
            )}
            <ToggleButton
              value="correct"
              selected={option.isCorrect}
              color="success"
              onChange={(e) => selectOption(index)}
            >
              {option.isCorrect ? <CheckIcon /> : <ClearIcon />}
            </ToggleButton>
            {!selectOnly && (
              <>
                <TextField
                  id="outlined-text"
                  label={`Option ${index + 1}`}
                  variant="outlined"
                  value={option.text}
                  fullWidth
                  error={option.text.length === 0}
                  onChange={(e) => {
                    const newOptions = [...options]
                    newOptions[index].text = e.target.value
                    setOptions(newOptions)
                    onChange(index, newOptions)
                  }}
                />
                <IconButton
                  variant="small"
                  color="error"
                  onClick={() => {
                    let newOptions = [...options]
                    const deleted = options[index]
                    newOptions.splice(index, 1)
                    setOptions(newOptions)
                    onDelete(index, deleted)
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}

            {selectOnly && (
              <Typography variant="body1">{option.text}</Typography>
            )}
          </Stack>
        ))}
      </ReorderableList>
    </Stack>
  )
}

export default MultipleChoice
