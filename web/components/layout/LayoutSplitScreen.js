import { Box, Stack } from '@mui/material';

import SnackbarFeedback from '../feedback/SnackbarFeedback';
import ResizePanel from './utils/ResizePanel';
import Header from './Header';

const LayoutSplitScreen = ({header, subheader, leftPanel, rightPanel, rightWidth = 60}) => {
    return (
        <>
        <Box>
            <Header color="transparent">
                {header}
            </Header>
            { subheader && (
                <Box sx={{ flex: 1, overflow:'hidden' }}>{subheader}</Box>
            )}
            <Stack sx={{ height: `calc(100vh - 48px - ${subheader ? '52px' : '0px'})`, width:'100vw' }} alignItems="center">
                <Stack sx={{ minWidth:'100%', minHeight: '100%' }}>
                    <ResizePanel 
                        rightWidth={rightWidth}
                        leftPanel={leftPanel}
                        rightPanel={rightPanel}
                    />
                </Stack>
            </Stack>
        </Box> 
        <SnackbarFeedback />
       </>
    );
}


export default LayoutSplitScreen;