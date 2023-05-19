import { Chip, Stack, Typography } from '@mui/material'
const GradingPointsComment = ({ points, maxPoints, comment }) => {
  let color = points > 0 ? 'success' : 'error'
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Chip
        variant="outlined"
        color={color}
        label={
          <>
            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
              <b>{points}</b>
            </Typography>
            <Typography variant="caption" component="span">
              / {maxPoints} pts
            </Typography>
          </>
        }
      />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {comment}
      </Typography>
    </Stack>
  )
}

export default GradingPointsComment
