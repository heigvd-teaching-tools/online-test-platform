import { Checkbox, Stack, Typography } from "@mui/material"
import { useCallback } from "react"

const CheckboxLabel = ({ label, checked, intermediate = undefined, onChange }) => {
    const setToggleCheckBox = useCallback(
      () => onChange && onChange(!checked),
      [onChange, checked],
    )
    return (
      <Stack
        direction="row"
        alignItems="center"
        onClick={setToggleCheckBox}
        sx={{ cursor: 'pointer' }}
      >
        <Checkbox
          size={'small'}
          checked={checked}
          indeterminate={intermediate}
          color={'info'}
          sx={{
            padding: '4px',
          }}
          onChange={(e) => onChange(e.target.checked)}
        />
        <Typography variant="caption" color="info">
          {' '}
          {label}{' '}
        </Typography>
      </Stack>
    )
}

export default CheckboxLabel