import { Stack, IconButton, Avatar, Box, ListItemText, Typography } from '@mui/material';

const UserAvatar = ({ user, onCLick }) => {
    return (
        <Stack direction="row" onClick={onCLick} >   
            <IconButton sx={{ p: 0 }}>
                <Avatar alt={user.name} src={user.image} sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Box sx={{ ml:1, cursor:'pointer' }}>
                <ListItemText
                    primary={<Typography variant="body2">{user.name}</Typography>} 
                    secondary={<Typography variant="caption">{user.email}</Typography>} 
                />
            </Box>                           
        </Stack>
    )
}

export default UserAvatar;