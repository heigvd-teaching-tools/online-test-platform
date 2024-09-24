import { Button } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import DropdownSelector from "../input/DropdownSelector";

const OrganizationSelector = ({ organizations, onChanged }) => {
    const [selected, setSelected] = useState(null);
  
    const handleSelection = (value) => {
      setSelected(value);
    };
  
    const handleSubmit = async () => {
      if (selected) {
        // Send the selected organization to the server to update the session
        const res = await fetch('/api/update-organization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedOrganization: selected }),
        });
        
        if (res.ok) {
          // Refresh session to get the updated session object
          await onChanged();
        }
      }
    };
  
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
          }))}
          onSelect={async (value) => await handleSelection(value)}
        />
        <Button
          variant="text"
          onClick={handleSubmit}
        >
          Select
        </Button>
      </Stack> 
    );
  };

export default OrganizationSelector;