import { useState } from 'react';
import { Stack, Box, Button } from '@mui/material';
import Image from 'next/image';
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
        <Stack spacing={0} sx={{ p:1, display:'inline-flex', bgcolor: 'background.paper' }}>
            <Button onClick={() => setCollapsed(!collapsed)}>
                { collapsed ? 
                    <Image
                        src={`/svg/grading/expand.svg`}
                        alt="Arrow"
                        layout="fixed" width={16} height={16}
                    /> : 
                    <Image
                        src={`/svg/grading/collapse.svg`}
                        alt="Arrow"
                        layout="fixed" width={16} height={16}
                    />
                    }
            </Button>
            <Stack flex={1} sx={{ overflow:'auto' }}>
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
         
            <Button
                onClick={() => {
                    // previous participant
                    let index = participants.findIndex((p) => p.id === active.id);
                    if (index > 0) {
                        onParticipantClick(participants[index-1]);
                    }
                }}
            >
                <Arrow orientation="up" />
            </Button>
            <Button
                onClick={() => {
                    // next participant
                    let index = participants.findIndex((p) => p.id === active.id);
                    if (index < participants.length-1) {
                        onParticipantClick(participants[index+1]);
                    }
                }}
            >
                <Arrow orientation="down" />
            </Button>
        </Stack>
    )
}


const Arrow = ({ orientation }) => {
    return (
        <Image
            src={`/svg/grading/ctrl-${orientation}.svg`}
            alt="Arrow"
            layout="fixed" width={16} height={16}
        />
    )
}

export default ParticipantNav;