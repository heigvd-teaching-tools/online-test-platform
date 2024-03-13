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
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { toArray as typesToArray } from './types.js'
import languages from '../../code/languages.json'
import { useTags } from '../../context/TagContext'
import TagsSelector from '../input/TagsSelector'

const environments = languages.environments
const types = typesToArray()

const initialFilters = {
  title: '',
  content: '',
  tags: [],
  questionTypes: types
    .map((type) => type.value)
    .reduce((obj, type) => ({ ...obj, [type]: true }), {}),
  codeLanguages: environments
    .map((language) => language.language)
    .reduce((obj, language) => ({ ...obj, [language]: true }), {}),
}

const applyFilter = async (toApply) => {
  const query = { ...toApply }
  query.questionTypes = Object.keys(query.questionTypes).filter(
    (key) => query.questionTypes[key]
  )
  if (!toApply.questionTypes.code) {
    delete query.codeLanguages
  }
  if (query.codeLanguages) {
    query.codeLanguages = Object.keys(query.codeLanguages).filter(
      (key) => query.codeLanguages[key]
    )
  }
  return query
}

const queryStringToFilter = (queryString) => {
  const params = new URLSearchParams(queryString)

  // Build the filter object based on the query string
  const filter = {
    title: params.get('title') || initialFilters.title,
    content: params.get('content') || initialFilters.content,
    tags: params.get('tags')
      ? params.get('tags').split(',')
      : initialFilters.tags,
    questionTypes: { ...initialFilters.questionTypes },
    codeLanguages: { ...initialFilters.codeLanguages },
  }

  if (params.get('questionTypes')) {
    // set all questionTypes to false
    Object.keys(filter.questionTypes).forEach((type) => {
      filter.questionTypes[type] = false
    })

    // Update questionTypes and codeLanguages based on the query string
    params
      .get('questionTypes')
      .split(',')
      .forEach((type) => {
        if (filter.questionTypes.hasOwnProperty(type)) {
          filter.questionTypes[type] = true
        }
      })
  }

  // Update codeLanguages based on the query string
  if (params.get('codeLanguages')) {
    // set all codeLanguages to false
    Object.keys(filter.codeLanguages).forEach((language) => {
      filter.codeLanguages[language] = false
    })

    // Update codeLanguages based on the query string
    params
      .get('codeLanguages')
      ?.split(',')
      .forEach((language) => {
        if (filter.codeLanguages.hasOwnProperty(language)) {
          filter.codeLanguages[language] = true
        }
      })
  }

  return filter
}

const QuestionFilter = ({ filters: initial, onApplyFilter }) => {
  const { tags: allTags } = useTags()

  const [filter, setFilter] = useState(queryStringToFilter(initial))

  useEffect(() => {
    setFilter(queryStringToFilter(initial))
  }, [initial])

  const updateFilter = useCallback(
    (key, value) => {
      const newFilter = { ...filter, [key]: value }
      setFilter(newFilter)
    },
    [filter]
  )

  const isFilterApplied = useCallback(() => {
    // Compare each filter field with its initial value
    return (
      filter.title !== initialFilters.title ||
      filter.content !== initialFilters.content ||
      JSON.stringify(filter.tags) !== JSON.stringify(initialFilters.tags) ||
      JSON.stringify(filter.questionTypes) !==
        JSON.stringify(initialFilters.questionTypes) ||
      JSON.stringify(filter.codeLanguages) !==
        JSON.stringify(initialFilters.codeLanguages)
    )
  }, [filter])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault() // Prevent default form submission which reloads the page
      const newFilter = await applyFilter(filter)
      onApplyFilter && onApplyFilter(new URLSearchParams(newFilter).toString())
    },
    [filter, onApplyFilter]
  )

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} padding={2}>
        <Typography variant="body2" color="info">
          {' '}
          Filters
        </Typography>
        <TextField
          label={'Filter by title'}
          variant="outlined"
          fullWidth
          color="info"
          size="small"
          value={filter.title}
          onChange={(e) => updateFilter('title', e.target.value)}
        />

        <TextField
          label={'Filter by content'}
          variant="outlined"
          fullWidth
          color="info"
          size="small"
          value={filter.content}
          onChange={(e) => updateFilter('content', e.target.value)}
        />

        <TagsSelector
          label={'Filter by tags'}
          size={'small'}
          color={'info'}
          options={allTags.map((tag) => tag.label)}
          value={filter.tags}
          onChange={(tags) => updateFilter('tags', tags)}
        />

        <Typography variant="body2" color="info">
          {' '}
          Question types{' '}
        </Typography>
        <Box>
          {types.map((type) => (
            <CheckboxLabel
              key={type.value}
              label={type.label}
              checked={filter.questionTypes[type.value]}
              onChange={(checked) =>
                updateFilter('questionTypes', {
                  ...filter.questionTypes,
                  [type.value]: checked,
                })
              }
            />
          ))}
        </Box>
        {filter.questionTypes.code && (
          <>
            <Typography variant="body2" color="info">
              {' '}
              Code languages{' '}
            </Typography>
            <Box>
              {environments.map((language) => (
                <CheckboxLabel
                  key={language.language}
                  label={language.label}
                  checked={filter.codeLanguages[language.language]}
                  onChange={(checked) =>
                    updateFilter('codeLanguages', {
                      ...filter.codeLanguages,
                      [language.language]: checked,
                    })
                  }
                />
              ))}
            </Box>
          </>
        )}
        <Stack direction={'row'} spacing={2}>
          <Button variant="contained" color="info" fullWidth type="submit">
            {' '}
            Filter{' '}
          </Button>
          <Button
            variant="outlined"
            disabled={!isFilterApplied()}
            onClick={async () => {
              setFilter(initialFilters)
              onApplyFilter && onApplyFilter(await applyFilter(initialFilters))
            }}
          >
            {' '}
            Clear{' '}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
const CheckboxLabel = ({ label, checked, onChange }) => {
  const setToggleCheckBox = useCallback(
    () => onChange && onChange(!checked),
    [onChange, checked]
  )
  return (
    <Stack
      direction="row"
      alignItems="center"
      onClick={setToggleCheckBox}
      sx={{ cursor: 'pointer' }}
    >
      <Checkbox
        size={'small'}
        checked={checked}
        color={'info'}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Typography variant="body1" color="info">
        {' '}
        {label}{' '}
      </Typography>
    </Stack>
  )
}

export default QuestionFilter
