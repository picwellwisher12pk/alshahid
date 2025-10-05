import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  // This effect handles redirection when redirectPath changes
  useEffect(() => {
    if (redirectPath) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
      setRedirectPath(null);
    }
  }, [redirectPath]);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Here you would typically validate the token with your backend
          // For now, we'll just check if it exists
          const userData = JSON.parse(localStorage.getItem('user') || 'null');
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    // In a real app, you would make an API call to your backend
    // This is a mock implementation
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'admin123') {
          const mockUser = { id: '1', email };
          setUser(mockUser);
          localStorage.setItem('token', 'dummy-jwt-token');
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setRedirectPath('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    // This will be caught by the router and redirected to /login
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
