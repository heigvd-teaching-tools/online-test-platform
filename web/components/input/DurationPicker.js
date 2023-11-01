import { Stack, MenuItem, Box } from '@mui/material'
import { useInput } from '../../code/useInput'
import DropDown from './DropDown'

const DurationPicker = ({ value, onChange }) => {
  const { value: hours, setValue: setHours } = useInput(value?.hours || 0)
  const { value: minutes, setValue: setMinutes } = useInput(value?.minutes || 0)

  return (
    <Box sx={{ width: '150px' }}>
      <Stack direction="row" spacing={2}>
        <DropDown
          id={'hours'}
          name={'Hours'}
          defaultValue={hours}
          onChange={(value) => {
            setHours(value)
            onChange({ hours: value, minutes })
          }}
          minWidth={'70px'}
        >
          {[...Array(24).keys()].map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </DropDown>
        <DropDown
          id={'minutes'}
          name={'Minutes'}
          defaultValue={minutes}
          onChange={(value) => {
            setMinutes(value)
            onChange({ hours, minutes: value })
          }}
          minWidth={'80px'}
        >
          {[...Array(60 / 5).keys()].map((item) => (
            <MenuItem key={item * 5} value={item * 5}>
              {item * 5}
            </MenuItem>
          ))}
        </DropDown>
      </Stack>
    </Box>
  )
}

export default DurationPicker
