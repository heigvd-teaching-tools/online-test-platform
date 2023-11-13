import React, { useState, useEffect } from 'react';
import StatusDisplay from '../../../feedback/StatusDisplay';
import { Tooltip, Typography } from '@mui/material';

const connectionQuality = {
    "WIFI-FULL": {
        "effectiveType": ["4g"],
        "tooltip": "Your connection is excellent",
    },
    "WIFI-GOOD": {
        "effectiveType": ["3g"],
        "tooltip": "Your connection is good"
    },
    "WIFI-POOR": {
        "effectiveType": ["2g", "slow-2g"],
        "tooltip": "Your connection is poor"
    },
    "WIFI-OFF": {
        "tooltip": "You are offline"
    }

}

const ConnectionIndicator = () => {
    const [compatible, setCompatible] = useState(false);
    const [connectionInfo, setConnectionInfo] = useState({
      isOnline: navigator.onLine,
      effectiveType: '',
      rtt: 0,
      downlink: 0,
    });
  
    useEffect(() => {
      const updateConnectionInfo = () => {
        setConnectionInfo({
          isOnline: navigator.onLine,
          effectiveType: navigator.connection?.effectiveType || '',
          rtt: navigator.connection?.rtt || 0,
          downlink: navigator.connection?.downlink || 0,
        });
      };
  
      // Check if the browser supports the Network Information API
      setCompatible(!!navigator.connection);
  
      updateConnectionInfo();

      if(!window) return;
  
      window.addEventListener('online', updateConnectionInfo);
      window.addEventListener('offline', updateConnectionInfo);
      navigator.connection?.addEventListener('change', updateConnectionInfo);
  
      return () => {
        window.removeEventListener('online', updateConnectionInfo);
        window.removeEventListener('offline', updateConnectionInfo);
        navigator.connection?.removeEventListener('change', updateConnectionInfo);
      };
    }, []);
  
    const getStatus = () => {
      if (!connectionInfo.isOnline) return 'WIFI-OFF';
      if (!compatible) return null;
      const qualityStatus = Object.keys(connectionQuality).find((status) => {
        const que = connectionQuality[status];
        return que.effectiveType?.includes(connectionInfo.effectiveType);
      });
      return qualityStatus || 'WIFI-POOR';
    };
  
    const getTooltip = () => {
      if (!connectionInfo.isOnline) return 'You are offline';
      if (!compatible) return null;
      const qualityStatus = Object.keys(connectionQuality).find((status) => {
        const que = connectionQuality[status];
        return que.effectiveType?.includes(connectionInfo.effectiveType);
      });
      return connectionQuality[qualityStatus]?.tooltip || 'Your connection is poor';
    };
  
    return (
      compatible || !connectionInfo.isOnline ? 
          <Tooltip title={getTooltip()} placement="bottom">
              <Typography>
                  <StatusDisplay size={18} status={getStatus()} />
              </Typography>
          </Tooltip> : null
    );
  };
  
  export default ConnectionIndicator;
