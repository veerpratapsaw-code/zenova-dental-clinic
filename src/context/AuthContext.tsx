import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('zenova_admin_token');
    if (storedToken) {
      setToken(storedToken);
      // Validate token with backend
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.user) {
            setUser(data.data.user);
          } else {
            localStorage.removeItem('zenova_admin_token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('zenova_admin_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('zenova_admin_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('zenova_admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
