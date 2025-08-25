import { useAuthContext } from '@/contexts/AuthContext';

// Re-export types for backward compatibility
export type { User } from '@/contexts/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};