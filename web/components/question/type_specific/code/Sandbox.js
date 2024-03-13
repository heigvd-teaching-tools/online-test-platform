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
import { useDebouncedCallback } from 'use-debounce'
import { Stack, TextField, Typography } from '@mui/material'
import useSWR from 'swr'
import Loading from '../../../feedback/Loading'
import { fetcher } from '../../../../code/utils'
const Sandbox = ({ groupScope, questionId, language, onUpdate }) => {
  const {
    data: sandbox,
    mutate,
    error,
  } = useSWR(
    `/api/${groupScope}/questions/${questionId}/code/sandbox`,
    groupScope && questionId ? fetcher : null,
    { revalidateOnFocus: false }
  )

  const [image, setImage] = useState(sandbox?.image || '')
  const [beforeAll, setBeforeAll] = useState(sandbox?.beforeAll || '')

  useEffect(() => {
    setImage(sandbox?.image || '')
    setBeforeAll(sandbox?.beforeAll || '')
  }, [sandbox])

  useEffect(() => {
    ;(async () => await mutate())()
  }, [language, mutate])

  const onChange = useCallback(
    async (sandbox) => {
      await fetch(`/api/${groupScope}/questions/${questionId}/code/sandbox`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...sandbox,
        }),
      })
        .then(async (res) => {
          if (res.status === 200) {
            await mutate()
          }
        })
        .finally(() => {
          onUpdate && onUpdate()
        })
    },
    [groupScope, questionId, mutate, onUpdate]
  )

  const debouncedOnChange = useDebouncedCallback(onChange, 500)

  return (
    <Loading loading={!sandbox} errors={[error]}>
      <Stack spacing={2}>
        <Typography variant="h6">Sandbox</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            id="image"
            label="Image"
            variant="standard"
            value={image}
            onChange={(ev) => {
              setImage(ev.target.value)
              debouncedOnChange({
                ...sandbox,
                image: ev.target.value,
              })
            }}
          />
          <TextField
            id="compile"
            label="Before All"
            variant="standard"
            value={beforeAll}
            fullWidth
            onChange={(ev) => {
              setBeforeAll(ev.target.value)
              debouncedOnChange({
                ...sandbox,
                beforeAll: ev.target.value,
              })
            }}
          />
        </Stack>
      </Stack>
    </Loading>
  )
}

export default Sandbox
