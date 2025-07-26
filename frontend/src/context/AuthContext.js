// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await apiLogin(email, password);
            const userToStore = { 
                _id: userData._id, 
                name: userData.name, 
                email: userData.email, 
                role: userData.role, 
                avatar: userData.avatar 
            };
            localStorage.setItem('user', JSON.stringify(userToStore));
            localStorage.setItem('token', userData.token);
            setUser(userToStore);
            return userToStore; // Return user data on success
        } catch (error) {
            // If an error occurs, we re-throw it so the component can catch it.
            // This is crucial for the UI to display the error message.
            throw error; 
        }
    };

    const register = async (name, email, password) => {
        try {
            const userData = await apiRegister(name, email, password);
            const userToStore = { 
                _id: userData._id, 
                name: userData.name, 
                email: userData.email, 
                role: userData.role, 
                avatar: userData.avatar 
            };
            localStorage.setItem('user', JSON.stringify(userToStore));
            localStorage.setItem('token', userData.token);
            setUser(userToStore);
            return userToStore; // Return user data on success
        } catch (error) {
            throw error; // Re-throw the error for the component
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };
    
    const updateUserContext = (newUserData) => {
         const userToStore = { 
             _id: newUserData._id, 
             name: newUserData.name, 
             email: newUserData.email, 
             role: newUserData.role, 
             avatar: newUserData.avatar 
         };
         localStorage.setItem('user', JSON.stringify(userToStore));
         if(newUserData.token) {
             localStorage.setItem('token', newUserData.token);
         }
         setUser(userToStore);
    };

    const value = { user, isAuthenticated: !!user, loading, login, register, logout, updateUserContext };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);