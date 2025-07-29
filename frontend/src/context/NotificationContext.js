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
            setNotifications(res.data);
        } catch (error) {
            console.error("Could not fetch notifications", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        getNotifications();
    }, [getNotifications]);

    // The value provides the notifications and a function to manually refetch them
    const value = { notifications, refetchNotifications: getNotifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);