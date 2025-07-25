// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api'; // Import registerUser

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
    localStorage.setItem('token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
  };

  // NEW: Add register function
  const register = async (name, email, password, role) => {
    const data = await registerUser({ name, email, password, role });
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
    localStorage.setItem('token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  const updateUserContext = (newUserData) => {
    const updatedUser = {
        _id: newUserData._id,
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        avatar: newUserData.avatar,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('token', newUserData.token);
    setUser(updatedUser);
};


  const value = { user, isAuthenticated: !!user, login, register, logout, loading, updateUserContext }; // Add register to value

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
