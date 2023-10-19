import { Box, Drawer, Stack } from "@mui/material";
import { useState } from "react";

const ResizableDrawer = ({ open, width=70, onClose, children }) => {
    const [ dragging, setDragging ] = useState(false)
    const [ width, setWidth ] = useState(width); // Initially set to 70vw

    return (
        <Drawer
            anchor={'right'}
            open={open}
            PaperProps={{ style: { width: `${width}vw` } }}
            onClose={() => onClose()}
            >
            
            <Box pl={1} width={"100%"} height={"100%"} position={"relative"}>
                
                { dragging && (
                    <Stack position={"fixed"} top={0} left={0} right={0} bottom={0} width={"100vw"} height={"100vh"} zIndex={100}
                        onMouseMove={(e) => {
                            if (dragging) {
                            setWidth((window.innerWidth - e.clientX) / window.innerWidth * 100);
                            }
                        }}
                        onMouseUp={(e) => {
                            setDragging(false)
                        }}
                    />
                )}
                <Stack 
                    position={"absolute"}
                    top={0}
                    left={0}
                    bottom={0}
                    width={"24px"}
                    zIndex={2}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{
                        cursor: "ew-resize",
                    }}
                    onMouseDown={(e) => {
                        setDragging(true)
                    }}
                    onMouseUp={(e) => {
                        setDragging(false)
                    }}
                    
                >
                    <ResizeHandleIcon />
                </Stack>

                {children}
            </Box>
        </Drawer>
    )
    }
  
const ResizeHandleIcon = () => {
    return (
        <svg width="10" height="48" viewBox="0 0 10 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="100" fill="gray" />
            <rect x="8" width="1" height="100" fill="gray" />
        </svg>
    )
}

export default ResizableDrawer