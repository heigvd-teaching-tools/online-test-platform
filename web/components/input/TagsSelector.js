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
import { Alert, Autocomplete, Chip, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { createFilterOptions } from '@mui/material/Autocomplete'

const filterOptions = createFilterOptions({
  matchFrom: 'start',
  ignoreCase: true,
  ignoreAccents: true,
  stringify: (option) => option || '',
});

const SEPARATORS = [',', ';', '\n'];

const TagsSelector = ({
  options,
  value: initialValue = [],
  label = 'Tags',
  color = 'primary',
  size = 'medium',
  validateTag = () => true,
  formatTag = (tag) => tag,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState([]);
  const [invalidTags, setInvalidTags] = useState([]);

  useEffect(() => {
    const initialTags = initialValue.map(formatTag);
    setValue(initialTags);
    setInvalidTags(initialTags.filter(tag => !validateTag(tag)));
  }, [initialValue, formatTag, validateTag]);

  // Update the logic to handle both addition and deletion of tags
  const onChangeValue = useCallback(
    (_, newValue) => {
      // Directly update the value with newValue as it includes both added and removed tags
      setValue(newValue);
      // Update invalidTags based on the new set of tags
      setInvalidTags(newValue.filter(tag => !validateTag(tag)));

      // Invoke the external onChange handler with all tags, if provided
      if (onChange) {
        onChange(newValue);
      }
    },
    [validateTag, onChange],
  );

  const updateTags = useCallback(
    (newTags) => {
      const formattedTags = newTags.map(formatTag);
      // Keep all tags, including invalid ones, but filter out duplicates
      const allTags = Array.from(new Set([...value, ...formattedTags]));
      setValue(allTags);
      setInvalidTags(allTags.filter(tag => !validateTag(tag)));
      // Optionally, call onChange with all tags including invalid ones
      if (onChange) {
        onChange(allTags);
      }
    },
    [value, formatTag, validateTag, onChange],
  );

  const handleInputChange = useCallback(
    (event, newInputValue, reason) => {
      if (reason === 'input') {
        setInputValue(newInputValue);
      }
      if (reason === 'reset') {
        setInputValue('');
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (SEPARATORS.includes(event.key)) {
        event.preventDefault();
        if (inputValue) {
          const newTags = inputValue.split(new RegExp(SEPARATORS.join('|'))).filter(tag => tag);
          updateTags(newTags);
          setInputValue('');
        }
      }
    },
    [inputValue, updateTags],
  );

  const handlePaste = useCallback(
    (event) => {
      const paste = event.clipboardData.getData('text');
      const newTags = paste.split(new RegExp(SEPARATORS.join('|'))).filter(tag => tag);
      if (newTags.length) {
        event.preventDefault();
        updateTags(newTags);
      }
    },
    [updateTags],
  );

  const renderTag = useCallback(
    (getTagProps, tag, index) => (
      <Chip
        size={size}
        key={index}
        variant="outlined"
        label={tag}
        color={!validateTag(tag) ? 'error' : 'default'}
        {...getTagProps({ index })}
      />
    ),
    [size, validateTag],
  );

  return (
    <>
      <Autocomplete
        multiple
        id="tags-outlined"
        options={options}
        getOptionLabel={(option) => option || ''}
        value={value}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={onChangeValue} 
        filterSelectedOptions
        filterOptions={filterOptions}
        freeSolo
        size={size}
        onKeyDown={handleKeyDown}
        renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => renderTag(getTagProps, option, index))}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            color={color}
            size={size}
            onPaste={handlePaste}
            placeholder="+"
          />
        )}
      />
      {invalidTags.length > 0 && (
        <Alert severity="error" style={{ marginTop: '8px' }}>
        <Typography variant="caption" style={{ color: 'red', marginTop: '8px' }}>
          {invalidTags.length} invalid value{invalidTags.length > 1 ? 's' : ''}!
        </Typography>
        </Alert>
      )}
    </>
  );
};

export default TagsSelector;