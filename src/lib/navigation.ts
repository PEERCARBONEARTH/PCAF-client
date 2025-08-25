/**
 * Navigation utilities for handling authentication redirects
 */

export class NavigationService {
  private static readonly REDIRECT_KEY = 'auth_redirect_url';

  /**
   * Store the current URL to redirect to after authentication
   */
  static storeRedirectUrl(url?: string) {
    const redirectUrl = url || window.location.pathname + window.location.search;
    if (redirectUrl !== '/auth' && redirectUrl !== '/') {
      localStorage.setItem(this.REDIRECT_KEY, redirectUrl);
    }
  }

  /**
   * Get the stored redirect URL and clear it
   */
  static getAndClearRedirectUrl(): string | null {
    const url = localStorage.getItem(this.REDIRECT_KEY);
    if (url) {
      localStorage.removeItem(this.REDIRECT_KEY);
      return url;
    }
    return null;
  }

  /**
   * Navigate to the appropriate page after authentication
   */
  static navigateAfterAuth() {
    const redirectUrl = this.getAndClearRedirectUrl();
    
    if (redirectUrl) {
      // Use replace to avoid back button issues
      window.location.replace(redirectUrl);
    } else {
      // Default redirect to financed emissions platform
      window.location.replace('/financed-emissions');
    }
  }

  /**
   * Force a hard navigation (full page reload) to ensure proper state sync
   */
  static forceNavigate(url: string) {
    window.location.href = url;
  }

  /**
   * Check if the current page is an auth page
   */
  static isAuthPage(): boolean {
    return window.location.pathname === '/auth';
  }

  /**
   * Check if the current page is the landing page
   */
  static isLandingPage(): boolean {
    return window.location.pathname === '/';
  }
}