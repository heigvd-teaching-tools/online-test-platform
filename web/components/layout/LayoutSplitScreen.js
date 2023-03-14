import {Box, Paper, Stack} from '@mui/material';
import ResizePanel from './utils/ResizePanel';

const LayoutSplitScreen = ({subheader, leftPanel, rightPanel, footer, rightWidth = 60}) => {
    return (
        <Stack height="100%" maxHeight="100%">
            { subheader && subheader}
            <Stack flex={1} alignItems="center">
                <ResizePanel
                    rightWidth={rightWidth}
                    leftPanel={leftPanel}
                    rightPanel={
                        <Paper square elevation={0} sx={{ position:'relative', overflow:'hidden', height:'100%' }}>
                            <Stack position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden">
                                {rightPanel}
                            </Stack>
                        </Paper>
                    }
                />
            </Stack>
            {footer && footer}
       </Stack>
    );
}


export default LayoutSplitScreen;
