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
import DropDown from '../input/DropDown'
import GroupIcon from '@mui/icons-material/Group'
import { Button, MenuItem, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Loading from '../feedback/Loading'
import { useGroup } from '../../context/GroupContext'

const GroupSelector = () => {
  const { push, asPath, query } = useRouter()

  const { groupScope } = query

  const { groups, switchGroup, error: errorGroups } = useGroup()

  const findGroupBy = (what, value) =>
    groups?.map((uOg) => uOg.group).find((group) => group[what] === value) ||
    undefined

  const switchGroupLink = (group) => {
    // replaces the root part of the path by the new group scope
    return asPath.replace(/\/[^\/]*\//, `/${group.scope}/`)
  }

  const handleGroupClick = async (group) => {
    await push(switchGroupLink(group)).finally(() => {
      switchGroup(group.scope)
    })
  }

  const [selected, setSelected] = useState(undefined)

  useEffect(() => {
    if (groups) {
      const group = findGroupBy('scope', groupScope)
      setSelected(group)
    }
  }, [groupScope, groups])

  return (
    <Loading loading={!groups} error={errorGroups}>
      {groups?.length > 0 && selected && (
        <DropDown
          name="group"
          defaultValue={selected.label}
          minWidth={'100px'}
          icon={<GroupIcon />}
          variant={'filled'}
        >
          <Stack p={1} key={'groups-title'}>
            <Typography variant={'h6'}>Your groups</Typography>
          </Stack>
          {groups.map(({ group }) => (
            <MenuItem
              key={group.id}
              value={group.label}
              onClick={() => handleGroupClick(group)}
            >
              {group.label}
            </MenuItem>
          ))}
          <Stack p={1} key={'manage-groups'}>
            <Link href={`/groups`}>
              <Button startIcon={<GroupIcon />}>Manage Groups</Button>
            </Link>
          </Stack>
        </DropDown>
      )}
    </Loading>
  )
}

export default GroupSelector
