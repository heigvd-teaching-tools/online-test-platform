import { Box, Collapse } from "@mui/material"
import { useBottomPanel } from "../../../context/BottomPanelContext";

const BottomPanelContent = ({ children, ...props }) => {
    const { isPanelOpen } = useBottomPanel();
    return(
        <Box {...props} maxHeight={"80%"}>
            <Collapse in={isPanelOpen}>
                {children}
            </Collapse>
        </Box>
    )
}

export default BottomPanelContent