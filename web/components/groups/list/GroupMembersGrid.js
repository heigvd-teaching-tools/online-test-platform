import { Box, TextField, Typography } from '@mui/material'
import DataGrid from '../../ui/DataGrid'
import UserAvatar from '../../layout/UserAvatar'
import AlertFeedback from '../../feedback/AlertFeedback'
import { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from '../../../context/SnackbarContext'
import GroupScopeInput from "../../input/GroupScopeInput ";


const GroupMembersGrid = ({ group, onUpdate }) => {

  const { show: showSnackbar } = useSnackbar()

  const [label, setLabel] = useState(group.label)
  const [scope, setScope] = useState(group.scope)

  useEffect(() => {
    setLabel(group.label)
    setScope(group.scope)
  }, [group.id, group.label])

  const handleSaveGroup = useCallback(
    async (label, scope) => {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label,
          scope,
        }),
      })

      if (response.status === 200) {
        showSnackbar('Group saved', 'success')
        onUpdate && onUpdate(scope)
      } else {
        const data = await response.json()
        showSnackbar(data.message, 'error')
      }
    },
    [group, onUpdate, showSnackbar]
  )

  return (
    <Box minWidth={"100%"} pl={2} pr={2} pt={1}>
      <GroupScopeInput
        groupId={group.id}
        label={label}
        scope={scope}
        onChange={async (newLabel, newScope) => {
            setLabel(newLabel);
            setScope(newScope);
            console.log("onChange", newLabel, newScope)
            await handleSaveGroup(newLabel, newScope)
        }}
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
