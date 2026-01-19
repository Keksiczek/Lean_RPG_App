import { API_BASE_URL, getTenantId, ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const currentToken = this.getToken();
    if (!currentToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': getTenantId(),
        },
        body: JSON.stringify({ token: currentToken }),
      });

      if (response.ok) {
        const json: ApiResponse<{ token: string }> = await response.json();
        if (json.success && json.data?.token) {
          this.setToken(json.data.token);
          return json.data.token;
        }
      }
      
      localStorage.removeItem('auth_token');
      return null;
    } catch (e) {
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}, retries = 3): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': getTenantId(),
      ...options.headers as any,
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && !options.skipAuth) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          
          if (newToken) {
            this.onRefreshed(newToken);
            return this.request<T>(endpoint, options, retries);
          } else {
            localStorage.removeItem('auth_token');
            window.location.href = '/login'; 
            throw new Error('Session expired');
          }
        } else {
          return new Promise((resolve) => {
            this.addRefreshSubscriber(() => {
              resolve(this.request<T>(endpoint, options, retries));
            });
          });
        }
      }

      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10) * 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter + 500));
        return this.request<T>(endpoint, options, retries - 1);
      }

      const data: T = await response.json();

      // For compatibility with the backend complete package, we throw on non-2xx status
      // but let the hook handle the "success: false" if the body was received.
      if (!response.ok) {
        const errorMsg = (data as any)?.error || (data as any)?.message || `API Error: ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;

    } catch (error: any) {
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  public get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();