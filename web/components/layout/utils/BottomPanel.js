import {Stack, useTheme} from "@mui/material";
import { BottomPanelProvider } from "../../../context/BottomPanelContext";


const BottomPanel = ({ open, onChange, children, ...props }) => {
    /*
        Must be placed in a parent with position: relative
        open and onChange are optional, if not provided the panel will be uncontrolled
    * */
    const theme = useTheme();
   
    return(
        <BottomPanelProvider open={open} onChange={onChange}>
            <Stack bgcolor={theme.palette.grey["50"]} minHeight="100%" overflow="auto" {...props}>
                {children}
            </Stack>
        </BottomPanelProvider>
    )
}

export default BottomPanel
