import {useRouter} from "next/router";
import { Stack, TextField } from '@mui/material'

import { useInput } from '@/code/useInput'
import { useSnackbar } from '@/context/SnackbarContext'
import DialogFeedback from '@/components/feedback/DialogFeedback'

const AddCollectionDialog = ({ open, onClose, handleAddCollection }) => {
  const { query } = useRouter()

  const { groupScope } = query

  const { show: showSnackbar } = useSnackbar()
  const {
    value: label,
    bind: bindLabel,
    setError: setErrorLabel,
  } = useInput('')
  const handleAdd = async () => {
    if (label.length === 0) {
      setErrorLabel({ error: true, helperText: 'Label is required' })
      return
    }
    await fetch(`/api/${groupScope}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        label,
      }),
    }).then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          showSnackbar('Collection created successfully', 'success')
          onClose()
          handleAddCollection(data)
        } else {
          showSnackbar(data.message, 'error')
        }
      })
    })
  }

  return (
    <DialogFeedback
      open={open}
      onClose={onClose}
      title="Add Collection"
      content={
        <Stack spacing={2} pt={2} sx={{ width: '500px' }}>
          <TextField
            label="Label"
            id="collection-label"
            autoFocus={true}
            fullWidth
            value={label}
            {...bindLabel}
          />
        </Stack>
      }
      onConfirm={handleAdd}
    />
  )
}

export default AddCollectionDialog
