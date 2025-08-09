import { supabase } from '@/integrations/supabase/client';

export interface ConnectionResult {
  success: boolean;
  error?: string;
  latency?: number;
}

export const checkSupabaseConnection = async (): Promise<ConnectionResult> => {
  try {
    const startTime = Date.now();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('content_calendar')
      .select('id')
      .limit(1);
    
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