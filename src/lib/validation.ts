// Validation utilities for forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const authValidation = {
  email: (email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  password: (password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    
    // Check for at least one uppercase, one lowercase, one number, and one special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return { 
        isValid: false, 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      };
    }
    
    return { isValid: true };
  },

  name: (name: string): ValidationResult => {
    if (!name || !name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }
    
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    
    return { isValid: true };
  },

  organization: (organization: string): ValidationResult => {
    if (!organization || !organization.trim()) {
      return { isValid: false, error: 'Organization name is required' };
    }
    
    if (organization.trim().length > 100) {
      return { isValid: false, error: 'Organization name must be less than 100 characters' };
    }
    
    return { isValid: true };
  }
};