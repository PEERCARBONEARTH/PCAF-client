import { useState, useEffect } from 'react';
import { AuthService, AuthUser } from '@/lib/auth';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Computed from firstName + lastName
  role?: string;
  organization?: string;
  isApproved?: boolean;
  isEmailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const { user, error } = await AuthService.getCurrentUserProfile();
        
        if (user) {
          const mappedUser: User = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            organization: user.organization,
            isApproved: user.isActive,
            isEmailVerified: user.isEmailVerified,
          };

          // Set auth token for API client
          const token = AuthService.getToken();
          if (token) {
            apiClient.setAuthToken(token);
          }

          setAuthState({
            user: mappedUser,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          // Token invalid or user not found
          await AuthService.signOut();
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.success && result.user && result.accessToken) {
        const mappedUser: User = {
          id: result.user._id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role,
          organization: result.user.organization,
          isApproved: result.user.isActive,
          isEmailVerified: result.user.isEmailVerified,
        };

        // Set auth token for API client
        apiClient.setAuthToken(result.accessToken);

        setAuthState({
          user: mappedUser,
          loading: false,
          isAuthenticated: true,
        });

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        return { success: true };
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
        
        return { 
          success: false, 
          error: result.message || "Login failed",
          attemptsLeft: result.attemptsLeft
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organization?: string;
  }) => {
    try {
      const result = await AuthService.register(userData);
      
      if (result.success) {
        toast({
          title: "Registration successful",
          description: result.message || "Please check your email to verify your account.",
        });
        
        return { success: true, message: result.message };
      } else {
        toast({
          title: "Registration failed",
          description: result.message || "Registration failed",
          variant: "destructive",
        });
        
        return { success: false, error: result.message || "Registration failed" };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
      apiClient.setAuthToken('');
      
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'organization'>>) => {
    try {
      const result = await AuthService.updateProfile(updates);
      
      if (result.success && result.user) {
        const mappedUser: User = {
          id: result.user._id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role,
          organization: result.user.organization,
          isApproved: result.user.isActive,
          isEmailVerified: result.user.isEmailVerified,
        };

        setAuthState(prev => ({
          ...prev,
          user: mappedUser,
        }));

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });

        return { success: true };
      } else {
        toast({
          title: "Update failed",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        });
        
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, error: 'Update failed' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const result = await AuthService.requestPasswordReset(email);
      
      toast({
        title: result.success ? "Reset link sent" : "Reset failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        title: "Reset error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, message: 'Reset request failed' };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const result = await AuthService.resetPassword(token, password);
      
      toast({
        title: result.success ? "Password reset" : "Reset failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, message: 'Password reset failed' };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const result = await AuthService.verifyEmail(token);
      
      toast({
        title: result.success ? "Email verified" : "Verification failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      if (result.success) {
        // Refresh user profile to get updated verification status
        await checkAuthStatus();
      }

      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: "Verification error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, message: 'Email verification failed' };
    }
  };

  const refreshToken = async () => {
    try {
      const result = await AuthService.refreshToken();
      
      if (result.success && result.accessToken) {
        apiClient.setAuthToken(result.accessToken);
        return { success: true };
      } else {
        // Refresh failed, sign out
        await logout();
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return { success: false };
    }
  };

  // Helper methods
  const isApproved = () => {
    return authState.user?.isApproved === true;
  };

  const hasRole = (role: string) => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return authState.user ? roles.includes(authState.user.role || '') : false;
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    refreshToken,
    checkAuthStatus,
    isApproved,
    hasRole,
    hasAnyRole,
  };
};