import React from 'react'
import { MenuItem, Stack, Typography } from '@mui/material'
import DropDown from '@/components/input/DropDown'
import languages from '@/code/languages.json'
import LanguageIcon from './LanguageIcon'

const environments = languages.environments

const LanguageSelector = ({ language, onChange }) => {
  return (
    <DropDown
      id="language"
      name="Language"
      defaultValue={language}
      minWidth="200px"
      onChange={onChange}
    >
      {environments.map((env, i) => (
        <MenuItem key={i} value={env.language}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LanguageIcon language={env.language} size={22} />
            <Typography variant="body1">{env.label}</Typography>
          </Stack>
        </MenuItem>
      ))}
    </DropDown>
  )
}

export default LanguageSelector
