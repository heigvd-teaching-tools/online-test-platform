import { Stack, IconButton, Avatar, ListItemText, Typography, Collapse } from '@mui/material';
const UserAvatar = ({ user, collapsed, onCLick }) => {
    return (
        <Stack direction="row" onClick={onCLick} sx={{ cursor:'pointer' }}>
            <IconButton sx={{ p: 1 }}>
                <Avatar alt={user.name} src={user.image} sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Collapse orientation="horizontal" in={!collapsed}>
                <ListItemText
                    primary={<Typography variant="body2">{user.name}</Typography>}
                    secondary={<Typography variant="caption">{user.email}</Typography>}
                />
            </Collapse>
        </Stack>
    )
}

export default UserAvatar;
