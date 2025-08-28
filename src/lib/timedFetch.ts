// Web-safe timed fetch using AbortController + setTimeout
// Compatible with Expo Web export and Vercel builds

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
 * Generate a unique request ID that works in all environments
 */
function generateRequestId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Web-safe timed fetch implementation
 */
export async function timedFetch(
  input: RequestInfo | URL,
  init: TimedFetchOptions = {}
): Promise<TimedFetchResult> {
  const requestId = generateRequestId();
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  
  // Only use AbortController in browser environments
  let controller: AbortController | undefined;
  let timeout: NodeJS.Timeout | undefined;
  
  try {
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      timeout = setTimeout(() => controller!.abort(), init.timeoutMs ?? 15000);
    }
    
    // Add request ID header
    const headers = new Headers(init.headers);
    headers.set('x-request-id', requestId);
    
    const fetchOptions = { ...init, headers };
    if (controller) {
      fetchOptions.signal = controller.signal;
    }
    
    const res = await fetch(input, fetchOptions);
    
    if (timeout) clearTimeout(timeout);
    const ms = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
    
    // Log performance metrics
    console.debug('[net]', requestId, res.status, res.url, `${ms}ms`, res.headers.get('server-timing') ?? '');
    
    return { res, ms, requestId };
  } catch (error) {
    if (timeout) clearTimeout(timeout);
    const ms = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
    
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
  input: RequestInfo | URL,
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
