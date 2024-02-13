import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from '@/context/SnackbarContext'

import DataGrid from '@/components/ui/DataGrid'
import UserAvatar from '@/components/layout/UserAvatar'
import AlertFeedback from '@/components/feedback/AlertFeedback'

import GroupScopeInput from "@/components/input/GroupScopeInput ";
import { LoadingButton } from '@mui/lab'

const GroupMembersGrid = ({ group, onUpdate }) => {

  const { show: showSnackbar } = useSnackbar()

  const [label, setLabel] = useState(group.label)
  const [scope, setScope] = useState(group.scope)

  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    setLabel(group.label)
    setScope(group.scope)
  }, [group.id, group.label])

  const handleSaveGroup = useCallback(
    async (label, scope) => {
      setLoading(true)
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
      setLoading(false)
    },
    [group, onUpdate, showSnackbar]
  )

  return (
    <Box minWidth={"100%"} pl={2} pr={2} pt={1}>
      <Stack direction="row" alignItems="flex-start" spacing={2} width={"100%"}>
        <GroupScopeInput
          groupId={group.id}
          label={label}
          scope={scope}
          onChange={async (newLabel, newScope, available) => {
              if(!available) return
              setLabel(newLabel);
              setScope(newScope);
          }}
        />
        { group && group.label !== label && (
          <LoadingButton 
            variant="contained"
            onClick={() => handleSaveGroup(label, scope)}
            loading={loading}
          >
            Save
          </LoadingButton>
        )}
      </Stack>

      {group && group.members && group.members.length > 0 && (
        <DataGrid
          header={{
            columns: [
              {
                label: 'Member',
                column: { flexGrow: 1 },
                renderCell: (row) => <UserAvatar user={row.user} />,
              },
            ],
          }}
          items={group.members.map((member) => ({
            ...member,
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
