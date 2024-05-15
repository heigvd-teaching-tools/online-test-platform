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
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Stack,
  TextField,
  IconButton,
  ToggleButton,
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'

import DragHandleSVG from '@/components/layout/utils/DragHandleSVG'
import ReorderableList from '@/components/layout/utils/ReorderableList'
import { debounce } from 'lodash'
import { useDebouncedCallback } from 'use-debounce'

const MultipleChoice = ({
  id = 'multi_choice',
  limiterActivated,
  options: initial,
  onChangeOption,
  onChangeOrder,
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

  const selectOption = (id) => {
    const option = options.find((option) => option.id === id)
    option.isCorrect = !option.isCorrect
    setOptions([...options])
    onChangeOption(option)
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

  const round = useMemo(() => limiterActivated && options.filter(opt => opt.isCorrect).length === 1, [options, limiterActivated])

  return (
    <ReorderableList onChangeOrder={onReorder}>
      {options?.map((option, index) => (
        <MultipleChoiceOptionUpdate
          key={index}
          round={round}
          option={option}
          onSelect={(id) => selectOption(id)}
          onChangeOption={(value) => {
            const newOptions = [...options]
            const option = newOptions[index]
            option.text = value
            setOptions(newOptions)
            onChangeOption(option)
          }}
          onDelete={(order) => {
            let newOptions = [...options]
            const deleted = options[order]
            newOptions.splice(index, 1)
            setOptions(newOptions)
            onDelete(newOptions[index].id, deleted)
          }}
        />
      ))}
    </ReorderableList>
  )
}

const MultipleChoiceOptionUpdate = ({ round = false, option, onSelect, onChangeOption, onDelete }) => {

  const [ text, setText ] = useState(option.text)

  useEffect(() => {
    setText(option.text)
  }, [option.text])

  const debounceOnChange = useDebouncedCallback(onChangeOption, 500)

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ flex: 1 }}
    >
      
      <Stack justifyContent={'center'} sx={{ cursor: 'move' }}>
        <DragHandleSVG />
      </Stack>
      
      <ToggleButton
        value="correct"
        selected={option.isCorrect}
        color="success"
        size="small"
        onChange={(e) => onSelect(option.id)}
        sx={round && {
          borderRadius: '50%',
        }}
      >
        {option.isCorrect ? <CheckIcon /> : <ClearIcon />}
      </ToggleButton>
      
      <TextField
        id="outlined-text"
        label={`Option ${option.order + 1}`}
        variant="standard"
        size='small'
        value={text}
        fullWidth
        error={text.length === 0}
        onChange={(e) => {
          setText(e.target.value)
          debounceOnChange(e.target.value)
        }}
      />
      <IconButton
        variant="small"
        color="error"
        onClick={() => onDelete(option.order)}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  )
}

export default MultipleChoice
