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
import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import { useState } from 'react'
import DropdownSelector from '../input/DropdownSelector'

const OrganizationSelector = ({ organizations, onChanged }) => {
  const [selected, setSelected] = useState(null)

  const handleSelection = (value) => {
    setSelected(value)
  }

  const handleSubmit = async () => {
    if (selected) {
      // Send the selected organization to the server to update the session
      const res = await fetch('/api/update-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedOrganization: selected }),
      })

      if (res.ok) {
        // Refresh session to get the updated session object
        await onChanged()
      }
    }
  }

  return (
    <Stack direction={'row'} spacing={1}>
      <DropdownSelector
        color={'primary'}
        variant={'outlined'}
        label={(option) => option.label}
        value={selected}
        options={organizations.map((organization) => ({
          value: organization,
          label: organization,
        })) || []}
        onSelect={async (value) => await handleSelection(value)}
      />
      <Button variant="text" onClick={handleSubmit}>
        Select
      </Button>
    </Stack>
  )
}

export default OrganizationSelector
