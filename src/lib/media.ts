/**
 * Returns the URL as-is since all media is now from Supabase
 * Kept for backward compatibility
 */
export const proxiedUrl = (url: string): string => {
  return url || '';
};
