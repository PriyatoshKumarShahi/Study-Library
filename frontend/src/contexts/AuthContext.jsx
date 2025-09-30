// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken } from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setAuthToken(token);
        const res = await API.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('fetchMe error', err.response?.data || err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: t, user: u } = res.data;
      localStorage.setItem('token', t);
      setToken(t);
      setAuthToken(t);
      setUser(u);
      return { user: u };
    } catch (err) {
      // rethrow so pages can show messages
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const res = await API.post('/auth/register', payload);
      const { token: t, user: u } = res.data;
      localStorage.setItem('token', t);
      setToken(t);
      setAuthToken(t);
      setUser(u);
      return { user: u };
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await API.put('/profile', updates);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
