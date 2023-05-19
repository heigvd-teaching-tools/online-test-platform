import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

import { JamSessionPhase, JamSessionStatus, Role } from '@prisma/client'
import { Button, Typography, Stack, Tab } from '@mui/material'
import LayoutMain from '../../layout/LayoutMain'

import { useSnackbar } from '../../../context/SnackbarContext'
import LoadingAnimation from '../../feedback/Loading'
import ListJamSession from '../list/ListJamSession'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import DialogFeedback from '../../feedback/DialogFeedback'
import { useRouter } from 'next/router'
import Authorisation from '../../security/Authorisation'
import MainMenu from '../../layout/MainMenu'
import { useGroup } from '../../../context/GroupContext'
import { fetcher } from '../../../code/utils'
import Loading from '../../feedback/Loading'

const JamSessions = () => {
  const router = useRouter()

  const { group } = useGroup()

  const { show: showSnackbar } = useSnackbar()
  const [selected, setSelected] = useState(null)

  const { data, error, mutate } = useSWR(
    `/api/jam-sessions`,
    group ? fetcher : null
  )

  useEffect(() => {
    // if group changes, re-fetch jam-sessions
    if (group) {
      ;(async () => await mutate())()
    }
  }, [group, mutate])

  const [tab, setTab] = useState(1)
  const [jamSessions, setJamSessions] = useState(data)

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [endOfDraftDialogOpen, setEndOfDraftDialogOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setJamSessions(data)
    }
  }, [data])

  const endDraftPhase = async () => {
    setEndOfDraftDialogOpen(false)
    await fetch(`/api/jam-sessions/${selected.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ phase: JamSessionPhase.IN_PROGRESS }),
    })
    await router.push(`/jam-sessions/${selected.id}/in-progress`)
  }

  const archiveJamSession = async () => {
    await fetch(`/api/jam-sessions/${selected.id}`, {
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
  }

  const deleteJamSession = async () => {
    await fetch(`/api/jam-sessions/${selected.id}`, {
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
  }

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
                  <Tab label="Active" value={1} />
                  <Tab label="Archived" value={2} />
                </TabList>
                {tab === 1 && (
                  <Link href="/jam-sessions/new">
                    <Button>Create a new jam session</Button>
                  </Link>
                )}
              </Stack>
            }
            padding={2}
          >
            {jamSessions && jamSessions.length > 0 && (
              <ListJamSession
                jamSessions={jamSessions.filter(
                  (jamSession) =>
                    jamSession.status ===
                    (tab === 1
                      ? JamSessionStatus.ACTIVE
                      : JamSessionStatus.ARCHIVED)
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
