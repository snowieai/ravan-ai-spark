const PROJECT_URL = "https://vkfmtrovrxgalhekzfsu.supabase.co";

/**
 * Returns a proxied URL for external media to avoid CORS issues
 * If the URL is already from our project, return it as-is
 */
export const proxiedUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const projectUrlObj = new URL(PROJECT_URL);
    
    // If it's already from our project, no need to proxy
    if (urlObj.host === projectUrlObj.host) {
      return url;
    }
    
    // Proxy external URLs through our edge function
    return `${PROJECT_URL}/functions/v1/media-proxy?url=${encodeURIComponent(url)}`;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return url;
  }
};
