import { supabase } from '@/integrations/supabase/client';

export interface ConnectionResult {
  success: boolean;
  error?: string;
  latency?: number;
}

export const checkSupabaseConnection = async (): Promise<ConnectionResult> => {
  try {
    const startTime = Date.now();
    
    // Use auth.getSession() as it's publicly accessible and doesn't require RLS
    const { data, error } = await supabase.auth.getSession();
    
    const latency = Date.now() - startTime;
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        error: error.message,
        latency
      };
    }
    
    return {
      success: true,
      latency
    };
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const result = await retryWithBackoff(queryFn);
    
    if (result.error) {
      return {
        data: null,
        error: result.error.message || 'Database query failed'
      };
    }
    
    return {
      data: result.data,
      error: null
    };
  } catch (error) {
    console.error('Safe query failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Supabase Auth health ping to detect CORS/blocked requests
export const supabaseAuthHealth = async (): Promise<{ ok: boolean; status: number; error?: string }> => {
  const url = 'https://vkfmtrovrxgalhekzfsu.supabase.co/auth/v1/health';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZm10cm92cnhnYWxoZWt6ZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTA5MzEsImV4cCI6MjA2NzQ4NjkzMX0.UgrqUj1PdficRXSPnk1XDjKUalvOxftl8tGu14euEhY',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : 'Network error' };
  }
};

// Detect if app is running inside an iframe (embedded preview)
export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // Cross-origin frame
  }
};

// Verify localStorage availability (blocked by some privacy settings)
export const testLocalStorage = (): { ok: boolean; error?: string } => {
  try {
    const key = `ls_test_${Date.now()}`;
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Storage blocked' };
  }
};