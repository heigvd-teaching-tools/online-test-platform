import { Box } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import languages from '../../../../code/languages.json'

const environments = languages.environments
const LanguageIcon = ({ language, size = 24 }) => {
  const index = environments.findIndex((env) => env.language === language)
  return (
    <Box minWidth={size} minHeight={size}>
      <Image
        src={environments[index].icon}
        alt={environments[index].language}
        width={size}
        height={size}
      />
    </Box>
  )
}

export default LanguageIcon
