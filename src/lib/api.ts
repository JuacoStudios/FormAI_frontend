// PERF: Unified API client with preflight checks and error handling
// Compatible with Expo Web export and Vercel builds

import config from '../../app/config';
import { timedFetch } from './timedFetch';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  requestId: string;
  responseTime: number;
}

export interface AnalyzeRequest {
  image: File | Blob;
  metadata?: {
    timestamp: number;
    deviceInfo?: string;
  };
}

export interface AnalyzeResponse {
  result: string;
  confidence: number;
  machineType: string;
  recommendations: string[];
}

/**
 * Preflight API check with consolidated logging
 */
export async function preflightCheck(): Promise<{
  url: string;
  method: string;
  status: number;
  timeMs: number;
  healthy: boolean;
}> {
  const start = Date.now();
  const url = `${config.backend.apiBaseUrl}/health`;
  
  try {
    const { res, ms } = await timedFetch(url, {
      method: 'GET',
      timeoutMs: 5000
    });
    
    const healthy = res.ok;
    const timeMs = Date.now() - start;
    
    // Consolidated log block
    console.log('[api] Preflight check:', {
      url,
      method: 'GET',
      status: res.status,
      timeMs,
      healthy,
      responseTime: ms
    });
    
    return { url, method: 'GET', status: res.status, timeMs, healthy };
  } catch (error) {
    const timeMs = Date.now() - start;
    console.error('[api] Preflight failed:', { url, method: 'GET', status: 0, timeMs, healthy: false, error });
    return { url, method: 'GET', status: 0, timeMs, healthy: false };
  }
}

/**
 * Analyze gym machine image
 */
export async function analyzeImage(payload: AnalyzeRequest): Promise<ApiResponse<AnalyzeResponse>> {
  const start = Date.now();
  const url = `${config.backend.apiBaseUrl}/api/analyze`;
  
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', payload.image, 'scan.webp');
    
    if (payload.metadata) {
      formData.append('metadata', JSON.stringify(payload.metadata));
    }
    
    const { res, ms, requestId } = await timedFetch(url, {
      method: 'POST',
      body: formData,
      timeoutMs: 30000, // 30s timeout for analysis
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const timeMs = Date.now() - start;
    
    if (res.ok) {
      const data = await res.json();
      console.log('[api] Analyze success:', { url, method: 'POST', status: res.status, timeMs, requestId });
      
      return {
        success: true,
        data,
        status: res.status,
        requestId,
        responseTime: timeMs
      };
    } else {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[api] Analyze failed:', { url, method: 'POST', status: res.status, timeMs, requestId, error: errorText });
      
      return {
        success: false,
        error: errorText,
        status: res.status,
        requestId,
        responseTime: timeMs
      };
    }
  } catch (error) {
    const timeMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('[api] Analyze error:', { url, method: 'POST', status: 0, timeMs, error: errorMessage });
    
    return {
      success: false,
      error: errorMessage,
      status: 0,
      requestId: 'unknown',
      responseTime: timeMs
    };
  }
}

/**
 * Get user profile and subscription status
 */
export async function getUserProfile(): Promise<ApiResponse<{
  isPremium: boolean;
  scanCount: number;
  freeQuota: number;
  subscriptionStatus?: string;
}>> {
  const start = Date.now();
  const url = `${config.backend.apiBaseUrl}/api/me`;
  
  try {
    const { res, ms, requestId } = await timedFetch(url, {
      method: 'GET',
      timeoutMs: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const timeMs = Date.now() - start;
    
    if (res.ok) {
      const data = await res.json();
      console.log('[api] Profile success:', { url, method: 'GET', status: res.status, timeMs, requestId });
      
      return {
        success: true,
        data,
        status: res.status,
        requestId,
        responseTime: timeMs
      };
    } else {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[api] Profile failed:', { url, method: 'GET', status: res.status, timeMs, requestId, error: errorText });
      
      return {
        success: false,
        error: errorText,
        status: res.status,
        requestId,
        responseTime: timeMs
      };
    }
  } catch (error) {
    const timeMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('[api] Profile error:', { url, method: 'GET', status: 0, timeMs, error: errorMessage });
    
    return {
      success: false,
      error: errorMessage,
      status: 0,
      requestId: 'unknown',
      responseTime: timeMs
    };
  }
}
