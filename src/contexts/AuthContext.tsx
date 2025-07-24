import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { userApi, setAuthErrorHandler } from '../pages/patron/services/apiService';

interface User {
  id: string;
  twitter_username?: string;
  wallet_address?: string;
}

interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  login: (sessionId: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextState>({
  isAuthenticated: false,
  user: null,
  sessionId: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(true);

  const logout = useCallback(() => {
    if (!isMounted) return;
    Cookies.remove('SID');
    setSessionId(null);
    setIsAuthenticated(false);
    setUser(null);
  }, [isMounted]);

  const fetchUserData = useCallback(async () => {
    try {
      const sessionToken = Cookies.get('SID');
      if (!sessionToken || !isMounted) return;

      const result = await userApi.getMe();
      if (!isMounted) return; // Prevent state updates if component unmounted
      
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true); // Only set authenticated after successful validation
      } else {
        // Session is invalid/expired, automatically clear it
        console.log('Session validation failed, clearing session automatically');
        setIsAuthenticated(false);
        setSessionId(null);
        setUser(null);
        Cookies.remove('SID');
      }
    } catch (error) {
      if (!isMounted) return; // Prevent state updates if component unmounted
      
      console.error('Failed to fetch user data:', error);
      // Also clear on network errors
      setIsAuthenticated(false);
      setSessionId(null);
      setUser(null);
      Cookies.remove('SID');
    }
  }, [isMounted]);

  const login = useCallback((newSessionId: string) => {
    Cookies.set('SID', newSessionId, { expires: 7 });
    setSessionId(newSessionId);
    setIsAuthenticated(true);
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    // Set up auth error handler for API service
    setAuthErrorHandler(() => {
      console.log('Session expired during API call, logging out...');
      // Only redirect if not on landing/auth pages (no alert, handled by toast in API calls)
      if (window.location.pathname !== '/' && !window.location.pathname.includes('get-started')) {
        window.location.href = '/get-started';
      }
      logout();
    });

    // Check for existing session on mount and validate it
    const existingSessionId = Cookies.get('SID');
    if (existingSessionId && !isAuthenticated) {
      console.log('Found existing session, validating...');
      setSessionId(existingSessionId);
      // Don't set authenticated until validation succeeds
      fetchUserData();
    }

    // Cleanup function
    return () => {
      setIsMounted(false);
    };
  }, [logout, fetchUserData, isAuthenticated]); // Include dependencies

  // Effect to handle session state sync
  useEffect(() => {
    const existingSessionId = Cookies.get('SID');
    if (!existingSessionId && isAuthenticated) {
      // No session cookie but state says authenticated - clear state
      console.log('No session cookie found, clearing auth state');
      setIsAuthenticated(false);
      setUser(null);
      setSessionId(null);
    }
  }, [isAuthenticated]);

  const value: AuthContextState = {
    isAuthenticated,
    user,
    sessionId,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
