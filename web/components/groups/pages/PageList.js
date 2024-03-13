/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState, useEffect, useCallback } from 'react'
import { Role } from '@prisma/client'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

import { fetcher } from '@/code/utils'
import { useGroup } from '@/context/GroupContext'

import LayoutMain from '@/components/layout/LayoutMain'
import LayoutSplitScreen from '@/components/layout/LayoutSplitScreen'

import Authorisation from '@/components/security/Authorisation'
import Loading from '@/components/feedback/Loading'
import AlertFeedback from '@/components/feedback/AlertFeedback'

import AddGroupDialog from '../list/AddGroupDialog'
import AddMemberDialog from '../list/AddMemberDialog'
import MyGroupsGrid from '../list/MyGroupsGrid'
import GroupMembersGrid from '../list/GroupMembersGrid'

const PageList = () => {
  const { data: session } = useSession()

  const currentGroup = session?.user?.selected_group

  const { groups, mutate: mutateGroups } = useGroup()

  const [selectedGroup, setSelectedGroup] = useState()
  const [updatingCurrentGroup, setUpdatingCurrentGroup] = useState(false)
  const [backUrl, setBackUrl] = useState('/' + currentGroup + '/questions')

  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)

  const {
    data: group,
    error,
    mutate,
  } = useSWR(
    `/api/groups/${selectedGroup && selectedGroup.id}/members`,
    selectedGroup ? fetcher : null
  )

  useEffect(() => {
    if (!selectedGroup && groups && groups.length > 0) {
      console.log('Select group index 0')
      setSelectedGroup(groups[0].group)
      setUpdatingCurrentGroup(groups[0].group.scope === currentGroup)
    }
  }, [groups, currentGroup])

  const onGroupsLeaveOrDelete = useCallback(
    async (groupId) => {
      if (selectedGroup && selectedGroup.id === groupId) {
        console.log('onGroupsLeaveOrDelete unselect group')
        setSelectedGroup(null)
        setUpdatingCurrentGroup(false)
      }
    },
    [selectedGroup, setSelectedGroup]
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!group} errors={[error]}>
        <LayoutMain
          header={
            <Box>
              <Link href={backUrl}>
                <Button startIcon={<ArrowBackIosIcon />}>Back</Button>
              </Link>
            </Box>
          }
        >
          <LayoutSplitScreen
            leftPanel={
              <>
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  sx={{ p: 1 }}
                >
                  <Typography variant="h6">My Groups</Typography>
                  <Button onClick={() => setAddGroupDialogOpen(true)}>
                    Create a new group
                  </Button>
                </Stack>
                <MyGroupsGrid
                  groups={groups}
                  onSelected={(group) => {
                    setSelectedGroup(group)
                    setUpdatingCurrentGroup(group.scope === currentGroup)
                  }}
                  onLeave={async (groupId) => {
                    await onGroupsLeaveOrDelete(groupId)
                    await mutateGroups()
                  }}
                  onDelete={async (groupId) => {
                    await onGroupsLeaveOrDelete(groupId)
                    await mutateGroups()
                  }}
                />
              </>
            }
            rightPanel={
              group ? (
                <>
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    sx={{ p: 1 }}
                  >
                    <Typography variant="h6">
                      Members of {group && group.label}
                    </Typography>
                    <Button onClick={() => setAddMemberDialogOpen(true)}>
                      Add a new member
                    </Button>
                  </Stack>
                  <GroupMembersGrid
                    group={group}
                    onUpdate={async (scope) => {
                      await mutate()
                      await mutateGroups()
                      if (updatingCurrentGroup) {
                        setBackUrl('/' + scope + '/questions')
                      }
                    }}
                  />
                </>
              ) : (
                <Stack p={2}>
                  <AlertFeedback severity="info">
                    <Typography variant="body1">
                      Select a group on the left to view its members.
                    </Typography>
                  </AlertFeedback>
                </Stack>
              )
            }
          />

          <AddGroupDialog
            open={addGroupDialogOpen}
            onClose={() => setAddGroupDialogOpen(false)}
          />

          <AddMemberDialog
            group={group}
            open={addMemberDialogOpen}
            onClose={() => setAddMemberDialogOpen(false)}
            onSuccess={async () => await mutate()} // force refresh
          />
        </LayoutMain>
      </Loading>
    </Authorisation>
  )
}

export default PageList
