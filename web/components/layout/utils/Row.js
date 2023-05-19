import { Stack } from '@mui/material'
const Row = ({
  children,
  align = 'center',
  spacing = 1,
  padding = 1,
  onClick,
}) => {
  return (
    <Stack
      direction="row"
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'auto' }}
      spacing={spacing}
      p={padding}
      width="100%"
      alignItems={align}
    >
      {children}
    </Stack>
  )
}

export default Row
