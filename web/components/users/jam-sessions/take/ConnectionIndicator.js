import React, { useState, useEffect } from 'react';
import StatusDisplay from '../../../feedback/StatusDisplay';
import { Stack, Tooltip, Typography } from '@mui/material';


const ConnectionIndicator = () => {
    const [ isOnline, setIsOnline ] = useState(false);

    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
  
    useEffect(() => {
        setIsOnline(navigator.onLine);
        
        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);

        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
        }
    }, [navigator.onLine]);
  
      
    return (  
        <Stack display={isOnline ? 'none' : 'flex'} direction="row" alignItems="center" spacing={1}>
            <Tooltip title="You are offline">
                <Typography>
                    <StatusDisplay size={18} status={isOnline ? 'WIFI-ON' : 'WIFI-OFF'} />
                </Typography>
            </Tooltip>
        </Stack>
    );
  };
  
  export default ConnectionIndicator;
