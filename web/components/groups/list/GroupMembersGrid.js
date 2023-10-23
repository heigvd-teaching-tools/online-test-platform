import { Box, TextField, Typography } from '@mui/material'
import DataGrid from '../../ui/DataGrid'
import UserAvatar from '../../layout/UserAvatar'
import AlertFeedback from '../../feedback/AlertFeedback'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useSnackbar } from '../../../context/SnackbarContext'


const GroupMembersGrid = ({ group, onUpdate }) => {

  const { show: showSnackbar } = useSnackbar()

  const [label, setLabel] = useState(group.label)

  useEffect(() => {
    setLabel(group.label)
  }, [group.id, group.label])

  const handleSaveGroup = useCallback(
    async () => {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label,
        }),
      })

      if (response.status === 200) {
        showSnackbar('Group saved', 'success')
        onUpdate && onUpdate()
      } else {
        const data = await response.json()
        showSnackbar(data.message, 'error')
      }
    },
    [group, label, onUpdate, showSnackbar]
  )

  const debounceUpdate = useDebouncedCallback(
    useCallback(async () => {
      await handleSaveGroup()
    }, [handleSaveGroup]),
    500
  )


  return (
    <Box minWidth={"100%"} pl={2} pr={2} pt={1}>
      <TextField
          label="Label"
          value={label}
          onChange={async (e) => {
            setLabel(e.target.value)
            debounceUpdate()
          }}
          fullWidth
        />
      {group && group.members && group.members.length > 0 && (
        <DataGrid
          header={{
            columns: [
              {
                label: 'Member',
                column: { flexGrow: 1 },
              },
            ],
          }}
          items={group.members.map((member) => ({
            member: <UserAvatar user={member.user} />,
            meta: {
              key: member.userId,
            },
          }))}
        />
      )}
      {group && group.members && group.members.length === 0 && (
        <AlertFeedback severity="info">
          <Typography variant="body1">
            There are no members in this group.
          </Typography>
        </AlertFeedback>
      )}
    </Box>
  )
}

export default GroupMembersGrid
