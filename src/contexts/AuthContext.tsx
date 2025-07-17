import React, { createContext, useContext, useState, useEffect } from 'react';
import { gowaApi } from '@/lib/api';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  isWhatsAppConnected?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  whatsappStatus: {
    connected: boolean;
    qrCode?: string;
    pairCode?: string;
  };
  refreshWhatsAppStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    qrCode: undefined as string | undefined,
    pairCode: undefined as string | undefined
  });

  // Check WhatsApp connection status
  const refreshWhatsAppStatus = async () => {
    if (!user) return;

    try {
      const status = await gowaApi.getAppStatus();
      setWhatsappStatus({
        connected: status.connected,
        qrCode: status.qr_code,
        pairCode: status.pair_code
      });
    } catch (error) {
      console.error('Failed to get WhatsApp status:', error);
      setWhatsappStatus(prev => ({ ...prev, connected: false }));
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('gowa-user');
    const storedAuth = localStorage.getItem('gowa-auth');

    if (storedUser && storedAuth) {
      try {
        const userData = JSON.parse(storedUser);
        const authData = JSON.parse(storedAuth);

        // Validate stored credentials by testing API access
        testApiAccess(authData.username, authData.password)
          .then((isValid) => {
            if (isValid) {
              setUser(userData);
              refreshWhatsAppStatus();
            } else {
              // Clear invalid credentials
              localStorage.removeItem('gowa-user');
              localStorage.removeItem('gowa-auth');
            }
          })
          .finally(() => setIsLoading(false));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('gowa-user');
        localStorage.removeItem('gowa-auth');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Test API access with credentials
  const testApiAccess = async (username: string, password: string): Promise<boolean> => {
    try {
      // Create a test API client with provided credentials
      const testAuth = btoa(`${username}:${password}`);
      const apiUrl = import.meta.env.VITE_GOWA_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/app/status`, {
        headers: {
          'Authorization': `Basic ${testAuth}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Test credentials against GOWA backend
      const isValid = await testApiAccess(username, password);

      if (isValid) {
        // Determine role based on username (simple logic for now)
        const role = username === 'admin' ? 'admin' : 'user';

        const userData: User = {
          id: Date.now().toString(),
          username,
          role,
          email: `${username}@gowa.com`,
          isWhatsAppConnected: false
        };

        // Store user data and auth credentials
        setUser(userData);
        localStorage.setItem('gowa-user', JSON.stringify(userData));
        localStorage.setItem('gowa-auth', JSON.stringify({ username, password }));

        // Update environment variables for API client
        (window as any).__GOWA_AUTH_USER__ = username;
        (window as any).__GOWA_AUTH_PASS__ = password;

        // Check WhatsApp connection status
        await refreshWhatsAppStatus();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setWhatsappStatus({ connected: false, qrCode: undefined, pairCode: undefined });
    localStorage.removeItem('gowa-user');
    localStorage.removeItem('gowa-auth');

    // Clear environment variables
    delete (window as any).__GOWA_AUTH_USER__;
    delete (window as any).__GOWA_AUTH_PASS__;
  };

  // Periodically refresh WhatsApp status when user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(refreshWhatsAppStatus, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      whatsappStatus,
      refreshWhatsAppStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};