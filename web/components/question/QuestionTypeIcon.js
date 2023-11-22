import Image from 'next/image'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { getTextByType, getTooltipByType, toArray as typesToArray } from './types.js'

const QuestionTypeIcon = ({ type, size = 32, withLabel = false }) => {
  return (
    <Tooltip title={getTooltipByType(type)} placement="top-start">
      <Stack
        direction={'row'}
        spacing={1}
        alignItems={'center'}
        minHeight={size}
      >
        <Box minWidth={size} minHeight={size}>
          <Image
            alt="Question Type Icon"
            src={`/svg/questions/${type}.svg`}
            layout="responsive"
            width={size}
            height={size}
            priority="1"
          />
        </Box>
        {withLabel && (
          <Typography variant="caption" sx={{ textAlign: 'center' }}>
            <b>{getTextByType(type)}</b>
          </Typography>
        )}
      </Stack>
    </Tooltip>
  )
}
export default QuestionTypeIcon
