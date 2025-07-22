'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'; // Import useEffect

// Define the shape of the user data and context
interface AuthUser {
  id: string;
  role: 'PATIENT' | 'DOCTOR';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; // Add a loading state
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state

  // A simple (and temporary) way to decode the JWT
  const decodeToken = (tokenStr: string): AuthUser | null => {
    try {
      const payload = JSON.parse(atob(tokenStr.split('.')[1]));
      return { id: payload.sub, role: payload.role };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  // ADD THIS useEffect TO CHECK LOCAL STORAGE ON INITIAL LOAD
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const userData = decodeToken(storedToken);
      if (userData) {
        setToken(storedToken);
        setUser(userData);
      }
    }
    setIsLoading(false); // Finished loading
  }, []);
  
  const login = (tokenStr: string) => {
    const userData = decodeToken(tokenStr);
    if (userData) {
      setToken(tokenStr);
      setUser(userData);
      localStorage.setItem('authToken', tokenStr);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}