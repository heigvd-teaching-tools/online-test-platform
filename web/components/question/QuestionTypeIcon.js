import Image from 'next/image'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import types from './types.json'
import { QuestionType } from '@prisma/client'
const getTooltipByType = (type) => {
  const typeObject = types.find(({ value }) => value === type)
  return typeObject?.label
}

const getTextByType = (type) => {
  switch (type) {
    case QuestionType.multipleChoice:
      return 'Multiple Choice'
    case QuestionType.trueFalse:
      return 'True/False'
    case QuestionType.code:
      return 'Code'
    case QuestionType.essay:
      return 'Essay'
    case QuestionType.web:
      return 'Web'
    default:
      return 'Unknown'
  }
}

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
