import { Box, Collapse } from "@mui/material"
import { useBottomPanel } from "../../../context/BottomPanelContext";

const BottomPanelContent = ({ children, ...props }) => {
    const { isPanelOpen } = useBottomPanel();
    return(
        <Box {...props}>
            <Collapse in={isPanelOpen}>
                {children}
            </Collapse>
        </Box>
    )
}

export default BottomPanelContent