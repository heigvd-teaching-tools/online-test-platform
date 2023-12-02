import { Stack } from "@mui/material"

const Overlay = ({ children }) => {
    return (
        <Stack
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.5)',
                zIndex: 100,
            }}
            alignItems={'center'}
            justifyContent={'center'}
            >
            <Stack spacing={2} alignItems={'center'}>
                {children} 
            </Stack>
                
        </Stack>
    )
}

export default Overlay
