// frontend/src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { user, isAuthenticated } = useAuth(); // Depend on the user object as well

    const getNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            return;
        }
        try {
            const res = await fetchNotifications();
            setNotifications(res.data);
        } catch (error) {
            // Don't show an error toast here as it can be annoying on every page load.
            // Console log is sufficient for debugging.
            console.error("Could not fetch notifications:", error.message);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // This effect will now re-run whenever the user logs in or out.
        getNotifications();

        const handleUpdate = () => {
            getNotifications();
        };
        
        window.addEventListener('notificationsUpdated', handleUpdate);

        return () => {
            window.removeEventListener('notificationsUpdated', handleUpdate);
        };
    }, [user, getNotifications]); // <-- Add 'user' as a dependency

    const value = { notifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);