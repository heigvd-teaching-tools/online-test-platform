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
import { Autocomplete, Chip, TextField } from '@mui/material'
import { useCallback } from 'react'
import { createFilterOptions } from '@mui/material/Autocomplete'

const filterOptions = createFilterOptions({
  matchFrom: 'start',
  ignoreCase: true,
  ignoreAccents: true,
  limit: 20, // suggestions limit
  stringify: (option) => {
    return option || ''
  },
})
const TagsSelector = ({
  options,
  value,
  label = 'Tags',
  color = 'primary',
  size = 'medium',
  onChange,
}) => {
  const onChangeValue = useCallback(
    (_, newValue) => {
      if (onChange) {
        onChange(newValue)
      }
    },
    [onChange]
  )

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={options}
      getOptionLabel={(option) => option || ''}
      value={value}
      filterSelectedOptions
      filterOptions={filterOptions}
      freeSolo
      size={size}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            size={size}
            key={index}
            variant="outlined"
            label={option || ''}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label={label} color={color} placeholder="+" />
      )}
      onChange={onChangeValue}
    />
  )
}

export default TagsSelector
