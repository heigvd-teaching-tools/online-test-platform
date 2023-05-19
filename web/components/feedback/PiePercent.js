import { Box, CircularProgress, Typography } from '@mui/material'
const PiePercent = ({
  value,
  max = 100,
  size = 45,
  label,
  thickness = 3.6,
  colors = { 0: '#d32f2f', 40: '#0288d1', 70: '#2e7d32' },
}) => {
  const percent = Math.round((value / max) * 100)

  const keys = Object.keys(colors).reverse()
  const index = keys.findIndex((key) => percent >= key)
  const color = colors[keys[index]]

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        size={size}
        variant="determinate"
        value={percent}
        sx={{ color: color }}
        thickness={thickness}
      />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label ? label : `${value}%`}
      </Typography>
    </Box>
  )
}
export default PiePercent
