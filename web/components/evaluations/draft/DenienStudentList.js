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
import { useCallback, useState } from 'react'
import {  Stack, Typography, Button } from '@mui/material'
import Image from 'next/image'

import UserAvatar from '@/components/layout/UserAvatar'
import Datagrid from '@/components/ui/DataGrid'
import DateTimeCell from '@/components/layout/utils/DateTimeCell'
import DialogFeedback from '@/components/feedback/DialogFeedback'

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

const DenienStudentList = ({
  groupScope,
  evaluationId,
  title,
  students,
  onStudentAllowed 
}) => {
 
  const [ selectedEmail, setSelectedEmail ] = useState(undefined)

  const onAllowStudent = useCallback(
    async () => {
      await fetch(
        `/api/${groupScope}/evaluations/${evaluationId}/students/allow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ studentEmail: selectedEmail })
        },
      ).then((res) => {
        if(res.ok){
          onStudentAllowed(selectedEmail)
        }
        
      })  
  }, [groupScope, evaluationId, selectedEmail, onStudentAllowed])
  
  return (
    <Stack>
      <Typography variant="h6">{title}</Typography>
      <Datagrid
        header={{ 
          actions: {
            label: 'Actions',
            width: '180px',
          },
          columns: columns 
        }}
        items={students?.map((student) => ({
          ...student,
          meta: {
            key: student.user.id,
            actions: [
              <Button
                key="edit"
                color="info"
                startIcon={<Image
                  alt="Remove From Collection"
                  src="/svg/icons/enter.svg"
                  width="24"
                  height="24"
                />}
                onClick={() => {
                  const studentEmail = student.user.email 
                  setSelectedEmail(studentEmail)                
                }}
              >
                Add to access list
              </Button>,
            ],
          },
        }))}
      />
      <DialogFeedback
        open={selectedEmail !== undefined}
        title={"Allow the student to access the evaluation"}
        content={
          <Typography variant={"body1"}>
            Are you sure you want to add {selectedEmail} to the access list? 
          </Typography>
        }
        onClose={() => {
          setSelectedEmail(undefined)
        }}
        onConfirm={() => {
          onAllowStudent(selectedEmail)
        }}
      />


    </Stack>
  )
}

export default DenienStudentList
