import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      // You might want to validate the token here
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      api.setToken(response.data.token);
      setUser({ username });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post('/auth/register', { username, password });
      localStorage.setItem('token', response.data.token);
      api.setToken(response.data.token);
      setUser({ username });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
