/**
 * Custom React Hooks for API Integration
 * Provides hooks for common API operations with loading/error states
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient, { ApiResponse, ApiError } from '../services/api';

// Generic hook for API calls
export function useApi<T>(
  initialState?: T
) {
  const [data, setData] = useState<T | null>(initialState || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) => {
      setLoading(true);
      setError(null);
      try {
        let response: ApiResponse<T>;
        switch (method) {
          case 'POST':
            response = await apiClient.post<T>(endpoint, body);
            break;
          case 'PUT':
            response = await apiClient.put<T>(endpoint, body);
            break;
          case 'DELETE':
            response = await apiClient.delete<T>(endpoint);
            break;
          case 'GET':
          default:
            response = await apiClient.get<T>(endpoint);
        }
        if (response.success && response.data) {
          setData(response.data);
          return response.data;
        } else {
          throw new ApiError(response.error || 'Unknown error', response.statusCode || 500, response.code);
        }
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 500);
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, execute };
}

// Hook for GET requests
export function useFetch<T>(
  endpoint: string,
  dependencies: any[] = [endpoint]
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<T>(endpoint);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new ApiError(response.error || 'Unknown error', response.statusCode || 500, response.code);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 500);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

// Hook for POST/PUT requests
export function useMutation<T>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (body?: any) => {
      setLoading(true);
      setError(null);
      try {
        let response: ApiResponse<T>;
        switch (method) {
          case 'POST':
            response = await apiClient.post<T>(endpoint, body);
            break;
          case 'PUT':
            response = await apiClient.put<T>(endpoint, body);
            break;
          case 'DELETE':
            response = await apiClient.delete<T>(endpoint);
            break;
          default:
            throw new Error('Invalid method');
        }
        if (response.success && response.data) {
          setData(response.data);
          return response.data;
        } else {
          throw new ApiError(response.error || 'Unknown error', response.statusCode || 500, response.code);
        }
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 500);
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  return { data, loading, error, execute };
}

// Hook for authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    // Listen for logout events
    const handleLogout = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.success && response.data?.accessToken) {
        apiClient.setAccessToken(response.data.accessToken);
        setIsAuthenticated(true);
        return response.data;
      } else {
        throw new ApiError(response.error || 'Login failed', response.statusCode || 400, response.code);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Login failed', 400);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, loading, error, login, logout };
}
