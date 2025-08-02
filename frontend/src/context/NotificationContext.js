// frontend/src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { isAuthenticated } = useAuth();

    const getNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]); // Clear notifications if user logs out
            return;
        }
        try {
            const res = await fetchNotifications();
            // This is the key: we are updating the state, which forces a re-render
            // for any component that uses this context.
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Could not fetch notifications:", error.message);
            setNotifications([]); // Set to empty array on error
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Fetch on initial load/login
        getNotifications();

        // The event handler now simply calls the stable getNotifications function.
        const handleUpdate = () => {
            console.log("NotificationContext heard 'notificationsUpdated' event. Refetching...");
            getNotifications();
        };
        
        window.addEventListener('notificationsUpdated', handleUpdate);

        // Cleanup the event listener
        return () => {
            window.removeEventListener('notificationsUpdated', handleUpdate);
        };
    }, [getNotifications]);

    // The value provided is the live 'notifications' state array.
    // The refetching mechanism is now handled entirely within this context.
    const value = { notifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);