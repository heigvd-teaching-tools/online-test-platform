import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material'
import QuestionTypeIcon from '../../question/QuestionTypeIcon'
import LanguageIcon from '../../question/type_specific/code/LanguageIcon'
import DateTimeAgo from '../../feedback/DateTimeAgo'
import QuestionTagsViewer from '../../question/tags/QuestionTagsViewer'

const QuestionListItem = ({ question, selected, actions = [] }) => {
  return (
    <Paper sx={{ p: 1, width: '100%' }} variant={selected ? 'outlined' : 'elevation'}>
      <Stack spacing={2} p={2}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <QuestionTypeIcon type={question.type} size={32} withLabel />
            {question.title && question.title.length > 0 ? (
              <Typography variant="body1">{question.title}</Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{ color: 'error.main' }}
              >{`{missing title}`}</Typography>
            )}
          </Stack>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <QuestionTagsViewer size={'small'} tags={question.questionToTag} />
            {question.type === 'code' && question.code?.language && (
              <LanguageIcon language={question.code?.language} size={22} />
            )}
          </Stack>
        </Stack>
        
        <Stack
          justifyContent={'space-between'}
          alignItems={'center'}
          direction={'row'}
          width="100%"
        >
          <Stack direction={'row'} spacing={0} alignItems={'center'}>
          {actions}
          </Stack>
          <Box>
            <Tooltip title="Last updated" placement="top">
              <Typography variant="body2" color="textSecondary">
                <DateTimeAgo date={new Date(question.updatedAt)} />
              </Typography>
            </Tooltip>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default QuestionListItem
