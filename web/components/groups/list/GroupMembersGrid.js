import { Box, Typography } from '@mui/material'
import DataGrid from '../../ui/DataGrid'
import UserAvatar from '../../layout/UserAvatar'
import AlertFeedback from '../../feedback/AlertFeedback'

const groupMembersGridHeader = {
  columns: [
    {
      label: 'Member',
      column: { flexGrow: 1 },
    },
  ],
}

const GroupMembersGrid = ({ group }) => {
  return (
    <Box sx={{ minWidth: '100%', pl: 2, pr: 2 }}>
      {group && group.members && group.members.length > 0 && (
        <DataGrid
          header={groupMembersGridHeader}
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
