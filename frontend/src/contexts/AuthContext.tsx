import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  language_pref: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        api.setToken(storedToken);
        const userData = await api.getMe();
        setUser(userData);
        setToken(storedToken);
      }
    } catch {
      await AsyncStorage.removeItem('auth_token');
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    api.setToken(res.token);
    await AsyncStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; phone: string; password: string; address?: string }) => {
    const res = await api.register(data);
    api.setToken(res.token);
    await AsyncStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: any) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
