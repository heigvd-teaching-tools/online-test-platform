import BottomPanel from "./BottomPanel";
import { useRef } from "react";
import ScrollContainer from "../ScrollContainer";

const BottomCollapsiblePanel = ({ children, bottomPanel, ...props }) => {
    const ref = useRef(null);
    return(
        <BottomPanel {...props}>
            <ScrollContainer ref={ref}>     
                {children}
            </ScrollContainer> 
            {bottomPanel}
        </BottomPanel>
    )
}

export default BottomCollapsiblePanel