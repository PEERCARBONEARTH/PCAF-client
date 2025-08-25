export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  accessToken?: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user && data.accessToken) {
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user && data.accessToken) {
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async signOut(): Promise<{ success: boolean; message?: string }> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    return { success: true, message: 'Logged out successfully' };
  }

  static async getCurrentUserProfile(): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { user: null };
      }

      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        return { user: data.user };
      }

      if (response.status === 401 || response.status === 403) {
        this.signOut();
        return { user: null, error: 'Authentication expired' };
      }

      return { user: null, error: data.message };
    } catch (error) {
      console.error('Get profile error:', error);
      return { user: null, error: 'Network error' };
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getStoredUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  static hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  static async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    organization?: string;
  }): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        success: data.success || false,
        message: data.message || 'Password reset request failed'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      return {
        success: data.success || false,
        message: data.message || 'Password reset failed'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return {
        success: data.success || false,
        message: data.message || 'Email verification failed'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No token to refresh' };
      }

      const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.accessToken) {
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        if (data.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
}