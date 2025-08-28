// PERF: Health check utilities for API validation and route verification

import config from '../config';
import { timedFetch } from './net';

export interface HealthCheckResult {
  ok: boolean;
  status: number;
  responseTime: number;
  requestId: string;
  error?: string;
  routes?: string[];
}

/**
 * Verify API is reachable and get health status
 */
export async function assertApiReachable(): Promise<HealthCheckResult> {
  const healthUrl = `${config.backend.apiBaseUrl}/health`;
  
  try {
    console.log('[health] Checking API health at:', healthUrl);
    
    const { res, ms, requestId } = await timedFetch(healthUrl, {
      method: 'GET',
      timeoutMs: 10000
    });
    
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log('[health] ✅ API healthy:', { status: res.status, responseTime: ms, requestId });
      
      return {
        ok: true,
        status: res.status,
        responseTime: ms,
        requestId,
        routes: data.routes
      };
    } else {
      console.warn('[health] ⚠️ API unhealthy:', { status: res.status, responseTime: ms, requestId });
      
      return {
        ok: false,
        status: res.status,
        responseTime: ms,
        requestId,
        error: `HTTP ${res.status}: ${res.statusText}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[health] ❌ API unreachable:', errorMessage);
    
    return {
      ok: false,
      status: 0,
      responseTime: 0,
      requestId: 'unknown',
      error: errorMessage
    };
  }
}

/**
 * Validate specific API endpoint exists
 */
export async function validateEndpoint(endpoint: string): Promise<boolean> {
  try {
    const url = `${config.backend.apiBaseUrl}${endpoint}`;
    console.log('[health] Validating endpoint:', url);
    
    const { res } = await timedFetch(url, {
      method: 'HEAD',
      timeoutMs: 5000
    });
    
    const exists = res.status !== 404;
    console.log(`[health] Endpoint ${endpoint}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    
    return exists;
  } catch (error) {
    console.error('[health] Endpoint validation failed:', error);
    return false;
  }
}

/**
 * Comprehensive API validation
 */
export async function validateApi(): Promise<{
  health: HealthCheckResult;
  analyzeEndpoint: boolean;
  overall: boolean;
}> {
  console.log('[health] Starting comprehensive API validation...');
  
  const health = await assertApiReachable();
  const analyzeEndpoint = await validateEndpoint('/analyze');
  
  const overall = health.ok && analyzeEndpoint;
  
  console.log('[health] Validation complete:', {
    health: health.ok,
    analyzeEndpoint,
    overall
  });
  
  return {
    health,
    analyzeEndpoint,
    overall
  };
}

/**
 * Show user-friendly error message for API issues
 */
export function getApiErrorMessage(result: HealthCheckResult): string {
  if (result.ok) return '';
  
  if (result.status === 404) {
    return 'API endpoint not found. Please check the backend configuration.';
  }
  
  if (result.status === 0) {
    return 'Cannot connect to the server. Please check your internet connection.';
  }
  
  if (result.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return `API error: ${result.error || 'Unknown error'}`;
}
