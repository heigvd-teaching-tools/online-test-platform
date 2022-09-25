import { useState } from 'react';
import { Stack, Box } from '@mui/material';

import UserAvatar from '../../layout/UserAvatar';
import FilledBullet from '../../feedback/FilledBullet';

const ParticipantItem = ({ participant, active, collapsed, onClick, isFilled }) => {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ pt: 1, pr:1, pb:1, display:'inline-flex', cursor: 'pointer' }} onClick={onClick}>
            <Stack direction="row" spacing={0}>
                {active ? (
                    <Box sx={{ width: 2, bgcolor: 'primary.main' }} /> 
                ) : (
                    <Box sx={{ width: 2, bgcolor: 'transparent' }} />
                )}
                <UserAvatar 
                    collapsed={collapsed}
                    user={participant} 
                />
                
            </Stack>
            <FilledBullet
                isFilled={isFilled}
            />
        </Stack>
    )
}

const ParticipantNav = ({ participants, active, onParticipantClick, isParticipantFilled }) => {
    const [ collapsed, setCollapsed ] = useState(true);
    return (
        <Stack spacing={0} sx={{ pl:1, pr:1, display:'inline-flex', bgcolor: 'background.paper' }} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
            {
                participants.map(
                    (participant) => (
                        <ParticipantItem 
                            key={participant.id}
                            active={active && active.id === participant.id}
                            collapsed={collapsed}
                            participant={participant}
                            onClick={() => onParticipantClick(participant)}
                            isFilled={() => isParticipantFilled(participant)}
                        />
                    )
                )
            }
        </Stack>
    )
}

export default ParticipantNav;