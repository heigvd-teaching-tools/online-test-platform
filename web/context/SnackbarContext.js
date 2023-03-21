import React, { createContext, useState, useContext, useCallback } from 'react';

const SnackbarContext = createContext();
export const useSnackbar = () => useContext(SnackbarContext);

const defaultPosition = {
    vertical: 'bottom',
    horizontal: 'left',
}
export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        position: defaultPosition,
        message: ''
    });

    const show = useCallback((message, severity) => {
        setSnackbar({
            position: defaultPosition,
            open: true, message, severity
        });
    }, []);

    const showTopRight = useCallback((message, severity) => {
        setSnackbar({
            position: {
                vertical: 'top',
                horizontal: 'right',
            },
            open: true, message, severity
        });
    }, []);

    const hide = () => {
        setSnackbar({ ...snackbar, open: false, message: '', severity: 'success' });
    }

    return (
        <SnackbarContext.Provider value={{
            snackbar,
            show,
            showTopRight,
            hide
        }}>
            {children}
        </SnackbarContext.Provider>
    );
}
