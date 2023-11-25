import { Stack } from '@mui/material'
const Row = ({
  children,
  align = 'center',
  spacing = 1,
  padding = 0,
  onClick,
}) => {
  return (
    <Stack
      direction="row"
      onClick={onClick}
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
