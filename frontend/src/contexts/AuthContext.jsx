import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken } from '../api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setAuthToken(t);
    setUser(u);
    return { user: u };
  };

  const register = async (payload) => {
    const res = await API.post('/auth/register', payload);
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setAuthToken(t);
    setUser(u);
    return { user: u };
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
