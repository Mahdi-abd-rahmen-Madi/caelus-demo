import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { AuthResponse, AuthState, LoginCredentials, User } from '../types/auth';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'REFRESH_FAILURE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Demo mock user
const mockUser: User = {
  id: 1,
  username: 'demo_user',
  email: 'demo@caelus.com',
  first_name: 'Demo',
  last_name: 'User',
  features: {
    has_railway_distance_feature: true,
    has_enedis_feature: true,
    has_rte_feature: true,
    has_plu_feature: true,
    has_georisques_feature: true,
    has_pci_feature: true,
    has_bdtopo_feature: true
  }
};

// Initial state - auto-authenticated for demo
const initialState: AuthState = {
  user: mockUser,
  accessToken: 'demo_token',
  refreshToken: 'demo_refresh_token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'REFRESH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        error: null,
      };
    case 'REFRESH_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await fetch(`${API_BASE_URL.replace('/geodata', '')}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      // Debug logging
      console.log('🔐 Login Response Debug:', {
        user: data.user,
        features: data.user?.features,
        hasRailwayFeature: data.user?.features?.has_railway_distance_feature
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.user,
          accessToken: data.access,
          refreshToken: data.refresh,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    dispatch({ type: 'LOGOUT' });
  };

  // Refresh token function
  const refreshAccessToken = async (): Promise<void> => {
    try {
      dispatch({ type: 'REFRESH_START' });

      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL.replace('/geodata', '')}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Store new tokens
      localStorage.setItem('accessToken', data.access);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      dispatch({
        type: 'REFRESH_SUCCESS',
        payload: {
          accessToken: data.access,
          refreshToken: data.refresh || refreshTokenValue,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      dispatch({ type: 'REFRESH_FAILURE', payload: errorMessage });
      // If refresh fails, log out user
      logout();
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Verify token by fetching user profile
          const response = await fetch(`${API_BASE_URL.replace('/geodata', '')}/auth/profile/`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();

            // Debug logging
            console.log('👤 Profile Response Debug:', {
              user: userData,
              features: userData?.features,
              hasRailwayFeature: userData?.features?.has_railway_distance_feature
            });

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: userData,
                accessToken,
                refreshToken,
              },
            });
          } else if (response.status === 401) {
            // Token expired, try to refresh
            await refreshAccessToken();
          }
        } catch (error) {
          // If both token verification and refresh fail, clear auth state
          logout();
        }
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    refreshAccessToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
