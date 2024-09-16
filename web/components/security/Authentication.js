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
import { useSession } from 'next-auth/react'
import LoadingAnimation from '../feedback/Loading'
import LoginGitHub from './LoginGitHub'
import { useState } from 'react'
import { Stack, Typography, Button } from '@mui/material';
import DropdownSelector from '../input/DropdownSelector';

const AffiliationSelector = ({ affiliations, onChanged }) => {
  const [selected, setSelected] = useState(null);

  const handleSelection = (value) => {
    setSelected(value);
  };

  const handleSubmit = async () => {
    if (selected) {
      // Send the selected affiliation to the server to update the session
      const res = await fetch('/api/update-affiliation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedAffiliation: selected }),
      });
      
      if (res.ok) {
        // Refresh session to get the updated session object
        await onChanged();
      }
    }
  };

  return (
    <Stack
      width={"100vw"}
      height={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      spacing={2}
    >
      <Typography variant="h6" gutterBottom>
        Please select your affiliation
      </Typography>
      <DropdownSelector
        color={'primary'}
        variant={'outlined'}
        label={(option) => option.label}
        value={selected}
        options={affiliations.map((affiliation) => ({
          value: affiliation,
          label: affiliation,
        }))}
        onSelect={async (value) => await handleSelection(value)}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
      >
        Select
      </Button>
    </Stack>
  );
};

const Authentication = ({ children }) => {
  const { data: session, status, update } = useSession();

  if (status === 'loading') return <LoadingAnimation />;
  if (status === 'unauthenticated') return <LoginGitHub />;

  if (status === 'authenticated') {
    console.log("session.user", session.user)
    if (session.user.selectedAffiliation === null) {
      return (
        <AffiliationSelector 
          affiliations={session.user.affiliations} 
          onChanged={async () => {
            await update();
          }}
        />
      );
    }

    return children;
  }

  return null; // Fallback if status is something unexpected
};

export default Authentication;

