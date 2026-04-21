import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API from '../utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('token')));

  const clearAuth = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthLoading(false);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      clearAuth();
      return null;
    }

    setAuthLoading(true);

    try {
      const response = await API.get('/auth/me');
      setToken(storedToken);
      setUser(response.data);
      return response.data;
    } catch (_) {
      clearAuth();
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (nextToken, initialUser = null) => {
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(initialUser);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (_) {
      // Local cleanup is still required when logout request fails.
    }

    clearAuth();
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearAuth();
    window.addEventListener('visionboard:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('visionboard:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    authLoading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    refreshUser,
  }), [token, user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
