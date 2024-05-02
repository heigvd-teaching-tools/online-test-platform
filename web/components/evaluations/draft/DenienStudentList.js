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

import { Stack, Typography } from '@mui/material'

import UserAvatar from '@/components/layout/UserAvatar'
import Datagrid from '@/components/ui/DataGrid'
import DateTimeCell from '@/components/layout/utils/DateTimeCell'
import ButtonAddToAccessList from './ButtonAddToAccessList'

const columns = [
  {
    label: 'Student',
    column: { minWidth: 230, flexGrow: 1 },
    renderCell: (row) => <UserAvatar user={row.user} />,
  },

  {
    label: 'Attempted at',
    column: { minWidth: 100, width: 100 },
    renderCell: (row) => <DateTimeCell dateTime={row.attemptedAt} />,
  },
]

const DeniedStudentList = ({
  groupScope,
  evaluationId,
  title,
  students,
  onStudentAllowed,
}) => {
  return (
    <Stack>
      <Typography variant="h6">{title}</Typography>
      <Datagrid
        header={{
          actions: {
            label: 'Actions',
            width: '180px',
          },
          columns: columns,
        }}
        items={students?.map((student) => ({
          ...student,
          meta: {
            key: student.user.id,
            actions: [
              <ButtonAddToAccessList
                key="allow"
                groupScope={groupScope}
                evaluationId={evaluationId}
                studentEmail={student.user.email}
                onStudentAllowed={onStudentAllowed}
              />,
            ],
          },
        }))}
      />
    </Stack>
  )
}

export default DeniedStudentList
