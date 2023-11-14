import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { JamSessionPhase } from '@prisma/client'
import { JamSessionStatus } from '@prisma/client'
import { Button, IconButton, Stack, Tooltip } from '@mui/material'

import { getStudentEntryLink } from '@/code/utils'
import DisplayPhase from '../DisplayPhase'
import DataGrid from '@/components/ui/DataGrid'

const ListJamSession = ({ groupScope, jamSessions, onStart, onDelete }) => (
  <DataGrid
    header={gridHeader}
    items={jamSessions?.map((jamSession) => ({
      label: jamSession.label,
      createdAt: new Date(jamSession.createdAt).toLocaleString(),
      updatedAt: new Date(jamSession.updatedAt).toLocaleString(),
      questions: jamSession.jamSessionToQuestions.length,
      students: jamSession.students.length,
      phase: (
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <DisplayPhase phase={jamSession.phase} />
          {jamSession.phase === JamSessionPhase.DRAFT && (
            <Button
              key="promote-to-in-progress"
              color="info"
              onClick={(ev) => onStart(ev, jamSession)}
              startIcon={
                <Image
                  alt="Promote"
                  src="/svg/icons/finish.svg"
                  layout="fixed"
                  width="18"
                  height="18"
                />
              }
            >
              Start
            </Button>
          )}
        </Stack>
      ),
      meta: {
        key: `jam-session-${jamSession.id}`,
        linkHref: `/${groupScope}/jam-sessions/${jamSession.id}`,
        actions: [
          <React.Fragment key="actions">
          <Tooltip title="Copy student link to clipboard" key="add-link-to-clipboard">
            <IconButton
              onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                ;(async () => {
                  await navigator.clipboard.writeText(
                    getStudentEntryLink(jamSession.id)
                  )
                })()
              }}
            >
              <Image
                alt="Copy link"
                src="/svg/icons/link.svg"
                layout="fixed"
                width="18"
                height="18"
              />
            </IconButton>
            </Tooltip>
            <Link href={`/${groupScope}/jam-sessions/${jamSession.id}/analytics`} passHref key="analytics">
              <Tooltip title="Open Analytics Page">
                <IconButton component="span">
                  <Image
                    alt="Analytics"
                    src="/svg/icons/analytics.svg"
                    layout="fixed"
                    width="18"
                    height="18"
                  />
                </IconButton>
              </Tooltip>
            </Link>
            { jamSession.status === JamSessionStatus.ACTIVE && (
                <Tooltip title="Add to archive" key="archive">
                  <IconButton

                    onClick={(ev) => onDelete(ev, jamSession)}
                  >
                    <Image
                      alt="Add to archive"
                      src="/svg/icons/archive.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                </IconButton>
                </Tooltip>
            )}

            { jamSession.status === JamSessionStatus.ARCHIVED && (
                <Tooltip title="Delete definitively" key="archive">
                  <IconButton
                    onClick={(ev) => onDelete(ev, jamSession)}
                  >
                    <Image
                      alt="Delete definitively"
                      src="/svg/icons/delete.svg"
                      layout="fixed"
                      width="18"
                      height="18"
                    />
                </IconButton>
                </Tooltip>
            )}


          </React.Fragment>,
        ],
      },
    }))}
  />
)

const gridHeader = {
  actions: {
    label: 'Actions',
    width: '110px',
  },
  columns: [
    {
      label: 'Label',
      column: { flexGrow: 1 },
    },
    {
      label: 'Created At',
      column: { width: '160px' },
    },
    {
      label: 'Updated At',
      column: { width: '160px' },
    },
    {
      label: 'Questions',
      column: { width: '80px' },
    },
    {
      label: 'Students',
      column: { width: '80px' },
    },
    {
      label: 'Phase',
      column: { width: '200px' },
    },
  ],
}

export default ListJamSession
