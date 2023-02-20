import { Box, Stack } from '@mui/material';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import Header from './Header';

const LayoutMain = ({children, header, subheader}) => {
    return (
        <>
            <Box sx={{ position: 'relative', pt:6 }}>
                <Header color="transparent">
                    {header}
                </Header>
                { subheader && (
                    <Box sx={{ flex: 1, overflow:'hidden' }}>{subheader}</Box>
                )}
                <Stack sx={{
                    height: 'calc(100vh - 48px)',
                    width: '100vw',
                    minHeight:'calc(100vh - 48px)',
                    minWidth:'100vw',
                    maxWidth:'100vw',
                    maxHeight:'calc(100vh - 48px)',
                }}
                    alignItems="center"
                >
                    {children}
                </Stack>
            </Box>

            <SnackbarFeedback />
       </>
    );
}


export default LayoutMain;
