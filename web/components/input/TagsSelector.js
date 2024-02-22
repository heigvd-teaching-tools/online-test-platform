import { Autocomplete, Chip, TextField } from '@mui/material'
import { useCallback } from 'react'
import { createFilterOptions } from '@mui/material/Autocomplete'

const filterOptions = createFilterOptions({
  matchFrom: 'start',
  ignoreCase: true,
  ignoreAccents: true,
  limit: 20, // suggestions limit
  stringify: (option) => {
    console.log('stringify', option)
    return option || ''
  }
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
