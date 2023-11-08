import React, {useCallback, useEffect, useState} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Stack, TextField, Typography } from '@mui/material'

const Setup = ({ groupScope, questionId, database, onChange }) => {

  const [image, setImage] = useState(database?.image)

  useEffect(() => {
    setImage(database?.image)
  }, [database])

  const onChangeImage = useCallback(async (database) => {
    await fetch(`/api/${groupScope}/questions/${questionId}/database`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(database),
    }).then((res) => res.json())

  }, [groupScope, questionId]);

  const debouncedOnChange = useDebouncedCallback(onChangeImage, 500)

  return (
      <Stack spacing={2}>
        <Typography variant="h6">Sandbox</Typography>
          <TextField
            id="image"
            label="Image"
            variant="standard"
            value={image}
            onChange={(ev) => {
              setImage(ev.target.value)
              const newDatabase = {
                ...database,
                image: ev.target.value,
              }
              onChange && onChange(newDatabase)
              debouncedOnChange(newDatabase)
            }}
          />
      </Stack>
  )
}

export default Setup
