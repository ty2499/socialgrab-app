// API Configuration for different environments
// This file handles API base URL configuration for development and production

/**
 * Get the API base URL based on environment
 * In development: uses relative URLs (same origin)
 * In production: uses VITE_API_BASE_URL environment variable
 */
export function getApiBaseUrl(): string {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // In development, use relative URLs (same origin as frontend)
  if (isDevelopment) {
    return '';
  }
  
  // For production, use the cPanel backend
  return 'https://api.socialgrab.app';
}

/**
 * Build a complete API URL by combining base URL with endpoint
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Environment configuration
 */
export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  googleAdsensePublisherId: import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID || '',
};

export default config;