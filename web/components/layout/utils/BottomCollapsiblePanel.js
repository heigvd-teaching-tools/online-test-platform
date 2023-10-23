import { Stack } from "@mui/material";
import BottomPanel from "./BottomPanel";
import { useRef } from "react";
import ScrollContainer from "../ScrollContainer";

const BottomCollapsiblePanel = ({ children, bottomPanel, ...props }) => {
    const ref = useRef(null);
    return(
        <Stack height={"100%"} {...props}>
            <BottomPanel>
                <Stack flex={1}>
                    <ScrollContainer ref={ref}>     
                        {children}
                    </ScrollContainer> 
                </Stack>
                {bottomPanel}
            </BottomPanel>
        </Stack>
    )
}

export default BottomCollapsiblePanel