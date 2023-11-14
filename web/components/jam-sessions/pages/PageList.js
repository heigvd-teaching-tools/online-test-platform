import {useState, useEffect, useCallback} from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { JamSessionPhase, JamSessionStatus, Role } from '@prisma/client'
import { Button, Typography, Stack, Tab } from '@mui/material'
import LayoutMain from '@/components/layout/LayoutMain'

import { useSnackbar } from '@/context/SnackbarContext'

import { fetcher } from '@/code/utils'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import DialogFeedback from '@/components/feedback/DialogFeedback'
import Authorisation from '@/components/security/Authorisation'

import MainMenu from '@/components/layout/MainMenu'

import Loading from '@/components/feedback/Loading'

import ListJamSession from '../list/ListJamSession'

const JamSessions = () => {
  const router = useRouter()

  const { groupScope } = router.query

  const { show: showSnackbar } = useSnackbar()
  const [selected, setSelected] = useState(null)

  const { data, error, mutate } = useSWR(
      `/api/${groupScope}/jam-sessions`,
      groupScope ? fetcher : null
  )

  const [tab, setTab] = useState(JamSessionStatus.ACTIVE)
  const [jamSessions, setJamSessions] = useState(data)

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [endOfDraftDialogOpen, setEndOfDraftDialogOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setJamSessions(data)
    }
  }, [data])

  const endDraftPhase = useCallback(async () => {
    setEndOfDraftDialogOpen(false)
    await fetch(`/api/${groupScope}/jam-sessions/${selected.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ phase: JamSessionPhase.IN_PROGRESS }),
    })
    await router.push(`/${groupScope}/jam-sessions/${selected.id}/in-progress`)
  }, [groupScope, router, selected])

  const archiveJamSession = useCallback(async () => {
    await fetch(`/api/${groupScope}/jam-sessions/${selected.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: JamSessionStatus.ARCHIVED }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((_) => {
        setJamSessions(
          jamSessions.map((jamSession) => {
            if (jamSession.id === selected.id) {
              jamSession.status = JamSessionStatus.ARCHIVED
            }
            return jamSession
          })
        )
        showSnackbar('Jam session archived', 'success')
      })
      .catch((_) => {
        showSnackbar('Error archiving collections session', 'error')
      })
    setSelected(null)
  }, [groupScope, jamSessions, selected, showSnackbar])

  const deleteJamSession = useCallback(async () => {
    await fetch(`/api/${groupScope}/jam-sessions/${selected.id}`, {
      method: 'DELETE',
    })
      .then((_) => {
        setJamSessions(
          jamSessions.filter((jamSession) => jamSession.id !== selected.id)
        )
        showSnackbar('Jam session deleted', 'success')
      })
      .catch((_) => {
        showSnackbar('Error deleting collections session', 'error')
      })
    setSelected(null)
  }, [groupScope, jamSessions, selected, showSnackbar])

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!jamSessions} errors={[error]}>
        <TabContext value={tab}>
          <LayoutMain
            header={<MainMenu />}
            subheader={
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                sx={{ pr: 2 }}
              >
                <TabList
                  onChange={(e, v) => setTab(v)}
                  aria-label="simple tabs example"
                >
                  <Tab label="Active" value={JamSessionStatus.ACTIVE} />
                  <Tab label="Archived" value={JamSessionStatus.ARCHIVED} />
                </TabList>
                {tab === JamSessionStatus.ACTIVE && (
                  <Link href={`/${groupScope}/jam-sessions/new`}>
                    <Button>Create a new jam session</Button>
                  </Link>
                )}
              </Stack>
            }
            padding={2}
          >
            {jamSessions && jamSessions.length > 0 && (
              <ListJamSession
                groupScope={groupScope}
                jamSessions={jamSessions.filter(
                  (jamSession) =>
                    jamSession.status === tab
                )}
                onStart={(ev, session) => {
                  ev.stopPropagation()
                  ev.preventDefault()
                  setSelected(session)
                  setEndOfDraftDialogOpen(true)
                }}
                onDelete={(ev, jamSession) => {
                  ev.preventDefault()
                  ev.stopPropagation()
                  setSelected(jamSession)
                  if (jamSession.status === JamSessionStatus.ARCHIVED) {
                    setDeleteDialogOpen(true)
                  } else {
                    setArchiveDialogOpen(true)
                  }
                }}
              />
            )}
          </LayoutMain>
          <DialogFeedback
            open={archiveDialogOpen}
            title="Archive this jam session"
            content="Are you sure you want to archive this jam session?"
            onClose={() => setArchiveDialogOpen(false)}
            onConfirm={archiveJamSession}
          />
          <DialogFeedback
            open={deleteDialogOpen}
            title="Delete this jam session"
            content="Are you sure you want to delete this jam session?"
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={deleteJamSession}
          />
          <DialogFeedback
            open={endOfDraftDialogOpen}
            title="End of DRAFT phase"
            content={
              <>
                <Typography variant="body1" gutterBottom>
                  This jam session is about to go to the <b>in-progress</b>{' '}
                  phase.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Registered students will be able to start with their jam
                  session.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Late student registrations will still be possible.
                </Typography>
                {selected &&
                  (selected.durationHours > 0 || selected.durationMins > 0) && (
                    <Typography variant="body1" gutterBottom>
                      End time estimated at{' '}
                      <b>
                        {new Date(
                          Date.now() +
                            selected.durationHours * 3600000 +
                            selected.durationMins * 60000
                        ).toLocaleTimeString()}
                      </b>
                      .
                    </Typography>
                  )}
                <Typography variant="button" gutterBottom>
                  {' '}
                  Are you sure you want to continue?`
                </Typography>
              </>
            }
            onClose={() => setEndOfDraftDialogOpen(false)}
            onConfirm={endDraftPhase}
          />
        </TabContext>
      </Loading>
    </Authorisation>
  )
}

export default JamSessions
