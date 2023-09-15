import { toArray as typesToArray } from './types.js'
import { MenuItem, Stack, Typography } from '@mui/material'
import DropDown from '../input/DropDown'
import React from 'react'

const types = typesToArray()

const TypeSelector = ({ type, onChange }) => {
  return (
    <DropDown
      id="question"
      name="Type"
      defaultValue={type}
      minWidth="160px"
      onChange={onChange}
    >
      {types?.map(({ value, label }) => (
        <MenuItem key={value} value={value}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption">{label}</Typography>
          </Stack>
        </MenuItem>
      ))}
    </DropDown>
  )
}
export default TypeSelector
