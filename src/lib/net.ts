// PERF: Network utility for optimized API calls with timing and request tracking
export interface TimedFetchResult {
  res: Response;
  ms: number;
  requestId: string;
}

export interface TimedFetchOptions extends RequestInit {
  timeoutMs?: number;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Enhanced fetch with timing, request IDs, and timeout handling
 */
export async function timedFetch(
  input: RequestInfo, 
  init: TimedFetchOptions = {}
): Promise<TimedFetchResult> {
  const requestId = crypto?.randomUUID?.() ?? String(Date.now());
  const start = performance.now();
  const controller = new AbortController();
  
  // Set timeout
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000);
  
  try {
    // Add request ID header
    const headers = new Headers(init.headers);
    headers.set('x-request-id', requestId);
    
    const res = await fetch(input, { 
      ...init, 
      signal: controller.signal, 
      headers 
    });
    
    clearTimeout(timeout);
    const ms = Math.round(performance.now() - start);
    
    // Log performance metrics
    console.debug('[net]', requestId, res.status, res.url, `${ms}ms`, res.headers.get('server-timing') ?? '');
    
    return { res, ms, requestId };
  } catch (error) {
    clearTimeout(timeout);
    const ms = Math.round(performance.now() - start);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[net]', requestId, 'TIMEOUT', `${ms}ms`);
      throw new Error(`Request timeout after ${ms}ms`);
    }
    
    console.error('[net]', requestId, 'ERROR', error, `${ms}ms`);
    throw error;
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function retryFetch(
  input: RequestInfo,
  init: TimedFetchOptions = {},
  retryCount = 0
): Promise<TimedFetchResult> {
  const maxRetries = init.maxRetries ?? 2;
  
  try {
    return await timedFetch(input, init);
  } catch (error) {
    if (retryCount >= maxRetries) {
      throw error;
    }
    
    // Exponential backoff: 500ms, 1000ms, 2000ms
    const delay = Math.min(500 * Math.pow(2, retryCount), 2000);
    console.log(`[net] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryFetch(input, init, retryCount + 1);
  }
}
