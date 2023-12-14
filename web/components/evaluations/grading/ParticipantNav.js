import { useEffect, useRef, useState } from 'react'
import { Stack, Box, Button } from '@mui/material'
import Image from 'next/image'

import UserAvatar from '@/components/layout/UserAvatar'
import FilledBullet from '@/components/feedback/FilledBullet'
import { forwardRef } from 'react'

const ParticipantItem = forwardRef(({
  participant,
  active,
  collapsed,
  onClick,
  isFilled,
}, ref) => {
  return (
    <Stack
      ref={ref}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ pt: 1, pr: 1, pb: 1, display: 'inline-flex', cursor: 'pointer' }}
      onClick={onClick}
    >
      <Stack direction="row" spacing={0}>
        {active ? (
          <Box sx={{ width: 2, bgcolor: 'primary.main' }} />
        ) : (
          <Box sx={{ width: 2, bgcolor: 'transparent' }} />
        )}
        <UserAvatar collapsed={collapsed} user={participant} />
      </Stack>
      <FilledBullet state={isFilled ? 'filled' : 'empty'} />
    </Stack>
  )
})

const ParticipantNav = ({
  participants,
  active,
  onParticipantClick,
  isParticipantFilled,
}) => {
  const [collapsed, setCollapsed] = useState(true)

  const participantRefs = useRef({}); // for auto-scrolling

  useEffect(() => {
    if (active && participantRefs.current[active.id]) {
      participantRefs.current[active.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active, participantRefs]);

  return (
    <Stack
      spacing={0}
      sx={{ p: 1, display: 'inline-flex', bgcolor: 'background.paper' }}
    >
      <Button onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? (
          <Image
            src={`/svg/grading/expand.svg`}
            alt="Arrow"
            width={16}
            height={16}
          />
        ) : (
          <Image
            src={`/svg/grading/collapse.svg`}
            alt="Arrow"
            width={16}
            height={16}
          />
        )}
      </Button>
      <Stack flex={1} sx={{ overflow: 'auto' }}>
        {participants.map((participant) => (
          <ParticipantItem
            key={participant.id}
            ref={(el) => participantRefs.current[participant.id] = el}
            active={active && active.id === participant.id}
            collapsed={collapsed}
            participant={participant}
            onClick={() => onParticipantClick(participant)}
            isFilled={isParticipantFilled(participant)}
          />
        ))}
      </Stack>

      <Button
        onClick={() => {
          // previous participant
          let index = participants.findIndex((p) => p.id === active.id)
          if (index > 0) {
            onParticipantClick(participants[index - 1])
          }
        }}
      >
        <Arrow orientation="up" />
      </Button>
      <Button
        onClick={() => {
          // next participant
          let index = participants.findIndex((p) => p.id === active.id)
          if (index < participants.length - 1) {
            onParticipantClick(participants[index + 1])
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
      width={16}
      height={16}
    />
  )
}

export default ParticipantNav
