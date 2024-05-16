import { Box, Fade, IconButton, Paper, Popper, Stack } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

const ConfigPopper = ({ 
    placement = 'bottom',
    size = 'small',
    label = 'Config',
    maxHeight = 700,
    width = 600,
    color = 'primary',
    children,
}) => {
    const paperRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const handleToggle = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prevOpen) => !prevOpen);
    }

    const handleClickAway = (event) => {
        if (paperRef.current && paperRef.current.contains(event.target)) {
            // If click inside the popper, do nothing
            return;
        }
        // If click outside the popper, close it
        setOpen(false);
    };

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickAway);
        } else {
            document.removeEventListener('mousedown', handleClickAway);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickAway);
        };
    }, [open]);

    const handlePaperMouseDown = (event) => {
        event.stopPropagation();
    };

    return (
        <Box>
            <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="center"
                sx={{ cursor: 'pointer' }}
                onClick={handleToggle}
            >
                {label && label}
                <IconButton size={size}>
                    <SettingsIcon color={color} fontSize='large'/>
                </IconButton>
            </Stack>
            <Popper
                open={open}
                anchorEl={anchorEl}
                placement={placement}
                transition
                sx={{ zIndex: 10000 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper 
                            elevation={3} 
                            ref={paperRef} 
                            onMouseDown={handlePaperMouseDown}
                            onClick={(e) => e.stopPropagation()} // Prevent Click event propagation
                        >
                            <Stack
                                p={2}
                                width={width}
                                maxWidth={600}
                                maxHeight={maxHeight}
                                bgcolor="background.paper"
                                overflow="auto"
                            >
                                {children}
                            </Stack>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </Box>
    );
}

export default ConfigPopper;
