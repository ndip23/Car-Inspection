// frontend/src/context/DeveloperAuthContext.js
import React, { createContext, useState, useContext } from 'react';

const DeveloperAuthContext = createContext(null);

export const DeveloperAuthProvider = ({ children }) => {
    const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);

    const authenticateDev = (password) => {
        if (password === process.env.REACT_APP_DEV_PASSWORD) {
            setIsDevAuthenticated(true);
            return true;
        }
        return false;
    };

    const value = { isDevAuthenticated, authenticateDev };

    return (
        <DeveloperAuthContext.Provider value={value}>
            {children}
        </DeveloperAuthContext.Provider>
    );
};

export const useDeveloperAuth = () => useContext(DeveloperAuthContext);