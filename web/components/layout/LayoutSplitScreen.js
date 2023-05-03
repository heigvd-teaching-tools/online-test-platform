import { Paper, Stack} from '@mui/material';
import ResizePanel from './utils/ResizePanel';
const LayoutSplitScreen = ({subheader, leftPanel, rightPanel, footer, rightWidth = 60}) => {
    return (
        <Stack height="100%" maxHeight="100%">
            { subheader && subheader}
            <Stack flex={1} alignItems="center" maxHeight="100%">
                <ResizePanel
                    rightWidth={rightWidth}
                    leftPanel={leftPanel}
                    rightPanel={
                        <Paper square elevation={0} sx={{ height:"100%", overflow:"hidden" }}>
                            {rightPanel}
                        </Paper>
                    }
                />
            </Stack>
            {footer && footer}
       </Stack>
    );
}


export default LayoutSplitScreen;
