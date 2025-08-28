# Performance Optimizations - FormAI Scan Flow

## Overview

This document describes the performance optimizations implemented for the FormAI scan flow to improve API reliability, reduce upload times, and provide better user experience.

## Implemented Optimizations

### 1. Network Layer (`src/lib/net.ts`)

- **`timedFetch`**: Enhanced fetch with timing, request IDs, and timeout handling
- **`retryFetch`**: Automatic retry with exponential backoff (500ms, 1000ms, 2000ms)
- **Request ID tracking**: Unique identifier for each request for debugging
- **Timeout handling**: Configurable timeouts with AbortController

### 2. Image Optimization (`src/lib/imageOptimizer.ts`)

- **WebP conversion**: Convert images to WebP format for smaller file sizes
- **Automatic downscaling**: Resize images to max 1024px on longest side
- **Quality optimization**: Configurable quality settings (default: 0.8)
- **Size reduction logging**: Track and log file size improvements

### 3. API Health Validation (`src/lib/healthCheck.ts`)

- **Health check endpoint**: Validate `/health` endpoint before making requests
- **Route validation**: Ensure `/analyze` endpoint exists
- **Comprehensive validation**: Check both health and endpoint availability
- **User-friendly error messages**: Clear error descriptions for different failure types

### 4. Enhanced Error Handling

- **Timeout detection**: Specific messages for slow requests
- **404 handling**: Clear messages for missing endpoints
- **Network error handling**: User-friendly network connectivity messages
- **Retry logic**: Automatic retry with smaller images on timeout

## Testing Instructions

### Local Development

1. **Start the application**:
   ```bash
   npm run start:web
   ```

2. **Open browser console** to see performance logs:
   - `[net]` - Network request timing and request IDs
   - `[image]` - Image optimization metrics
   - `[health]` - API health validation results

3. **Test scan flow**:
   - Take a photo with your camera
   - Observe console logs for timing and optimization
   - Check for request IDs and server-timing headers

### Console Logs to Monitor

#### Network Performance
```
[net] abc123-def456 200 https://formai-backend-dc3u.onrender.com/analyze 1250ms
[net] abc123-def456 TIMEOUT 15000ms
```

#### Image Optimization
```
[image] Downscaling from 1920x1080 to 1024x576 (scale: 0.53)
[image] Optimized: 2048000 → 512000 bytes (75.0% reduction)
```

#### API Health
```
[health] ✅ API healthy: { status: 200, responseTime: 150, requestId: "abc123" }
[health] Endpoint /analyze: ✅ EXISTS
```

### Performance Metrics

#### Expected Improvements

- **Upload size**: 60-80% reduction (JPEG → WebP + downscaling)
- **Response time**: 15s timeout with automatic retry
- **Error handling**: Clear messages for different failure types
- **Request tracking**: Unique IDs for debugging and monitoring

#### Baseline vs Optimized

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Image size | ~2-5MB | ~200-800KB | 60-80% |
| Timeout | None | 15s | Prevents hanging |
| Retry logic | None | Auto-retry | Better reliability |
| Error messages | Generic | Specific | Better UX |

## Backend Requirements

### Health Endpoint
The backend must provide:
```
GET /health
Response: { "ok": true, "ts": 1234567890, "routes": ["/analyze", "/health"] }
```

### Analyze Endpoint
```
POST /analyze
Content-Type: multipart/form-data
Body: image (file)
Response: { "success": true, "message": "..." }
```

### Server-Timing Headers
Backend should include:
```
Server-Timing: total;dur=1250
x-request-id: abc123-def456
```

## Troubleshooting

### Common Issues

1. **404 Errors**:
   - Check backend route configuration
   - Verify `/analyze` endpoint exists
   - Ensure no trailing slashes in API_BASE_URL

2. **Timeout Errors**:
   - Check backend response times
   - Verify image optimization is working
   - Check network connectivity

3. **Image Optimization Failures**:
   - WebP conversion may fail in older browsers
   - Fallback to original image is automatic
   - Check console for optimization logs

### Debug Mode

Enable detailed logging by checking:
- Network tab in DevTools
- Console logs with `[net]`, `[image]`, `[health]` prefixes
- Request/response headers including `x-request-id`

## Future Enhancements

- **Progressive image loading**: Show low-res preview while processing
- **Offline caching**: Cache results for repeated scans
- **Batch processing**: Handle multiple images simultaneously
- **Real-time progress**: Show upload and processing progress bars
