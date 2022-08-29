import React, { createContext, useState, useContext } from 'react';

const SnackbarContext = createContext();
export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: ''
    });
    const show = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    }

    const hide = () => {
        setSnackbar({ open: false, message: '', severity: 'success' });
    }

    return (
        <SnackbarContext.Provider value={{ snackbar, show, hide }}>
            {children}
        </SnackbarContext.Provider>
    );
}
