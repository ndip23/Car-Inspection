// frontend/src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { isAuthenticated } = useAuth();

    // useCallback ensures this function is stable and doesn't cause unnecessary re-renders
    const getNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]); // Clear notifications when the user logs out
            return;
        }
        try {
            const res = await fetchNotifications();
            setNotifications(res.data);
        } catch (error) {
            console.error("Could not fetch notifications", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // 1. Fetch notifications when the component first loads or when the user's auth status changes.
        getNotifications();

        // 2. Create the event handler function.
        const handleUpdate = () => {
            console.log("NotificationContext heard 'notificationsUpdated' event. Refetching...");
            getNotifications();
        };

        // 3. Add the event listener to the global window object.
        window.addEventListener('notificationsUpdated', handleUpdate);

        // 4. IMPORTANT: Clean up the event listener when the component unmounts to prevent memory leaks.
        return () => {
            window.removeEventListener('notificationsUpdated', handleUpdate);
        };
    }, [getNotifications]);

    // The context now provides the notifications data. The refetching is handled internally by the listener.
    const value = { notifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);