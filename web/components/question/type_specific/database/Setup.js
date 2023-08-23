import React, {useCallback, useEffect, useState} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Stack, TextField, Typography } from '@mui/material'
import useSWR from 'swr'
import Loading from '../../../feedback/Loading'
import { fetcher } from '../../../../code/utils'
const Setup = ({ questionId, database }) => {

  const [image, setImage] = useState(database?.image)

  useEffect(() => {
    setImage(database?.image)
  }, [database])

  const onChange = useCallback(async (database) => {
    await fetch(`/api/questions/${questionId}/database`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(database),
    })
  }, [questionId]);

  const debouncedOnChange = useDebouncedCallback(onChange, 500)

  return (
    <Loading loading={!database}>
        <Stack spacing={2}>
          <Typography variant="h6">Sandbox</Typography>
            <TextField
              id="image"
              label="Image"
              variant="standard"
              value={image}
              onChange={(ev) => {
                setImage(ev.target.value)
                debouncedOnChange({
                  ...database,
                  image: ev.target.value,
                })
              }}
            />
        </Stack>
    </Loading>
  )
}

export default Setup
