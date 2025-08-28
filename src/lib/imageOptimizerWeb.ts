// PERF: Web-safe image optimization utilities for reducing upload payload size
// Compatible with Expo Web export and Vercel builds

export interface ImageOptimizationOptions {
  maxDimension: number;
  quality: number;
  format: 'webp' | 'jpeg';
}

/**
 * Check if we're in a browser environment with canvas support
 */
function isBrowserWithCanvas(): boolean {
  return typeof window !== 'undefined' && 
         typeof HTMLCanvasElement !== 'undefined' && 
         typeof OffscreenCanvas !== 'undefined';
}

/**
 * Web-safe image downscaling using HTMLCanvasElement
 */
export async function downscaleImage(
  inputBlob: Blob, 
  maxDim = 1024, 
  quality = 0.8,
  format: 'webp' | 'jpeg' = 'webp'
): Promise<Blob> {
  try {
    // Only run in browser environments
    if (!isBrowserWithCanvas()) {
      console.warn('[image] Canvas not available, returning original image');
      return inputBlob;
    }
    
    const img = await createImageBitmap(inputBlob);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    
    console.log(`[image] Downscaling from ${img.width}x${img.height} to ${w}x${h} (scale: ${scale.toFixed(2)})`);
    
    // Use HTMLCanvasElement instead of OffscreenCanvas for better compatibility
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    
    // Convert to blob with appropriate format
    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(resolve, mimeType, quality);
    });
    
    if (!blob) {
      throw new Error('Failed to create blob from canvas');
    }
    
    img.close();
    
    console.log(`[image] Optimized: ${inputBlob.size} → ${blob.size} bytes (${((1 - blob.size / inputBlob.size) * 100).toFixed(1)}% reduction)`);
    
    return blob;
  } catch (error) {
    console.warn('[image] Image optimization failed, falling back to original:', error);
    return inputBlob;
  }
}

/**
 * Optimize image with fallback strategy
 */
export async function optimizeImage(
  inputBlob: Blob,
  options: Partial<ImageOptimizationOptions> = {}
): Promise<{ blob: Blob; sizeReduction: number }> {
  const defaultOptions: ImageOptimizationOptions = {
    maxDimension: 1024,
    quality: 0.8,
    format: 'webp'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  const originalSize = inputBlob.size;
  
  try {
    // Only optimize in browser environments
    if (!isBrowserWithCanvas()) {
      console.log('[image] Not in browser environment, skipping optimization');
      return {
        blob: inputBlob,
        sizeReduction: 0
      };
    }
    
    const optimizedBlob = await downscaleImage(
      inputBlob, 
      finalOptions.maxDimension, 
      finalOptions.quality,
      finalOptions.format
    );
    
    const sizeReduction = originalSize - optimizedBlob.size;
    
    return {
      blob: optimizedBlob,
      sizeReduction
    };
  } catch (error) {
    console.error('[image] Image optimization failed:', error);
    return {
      blob: inputBlob,
      sizeReduction: 0
    };
  }
}

/**
 * Get image dimensions from blob (browser-safe)
 */
export async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  try {
    if (typeof createImageBitmap !== 'undefined') {
      const img = await createImageBitmap(blob);
      const dimensions = { width: img.width, height: img.height };
      img.close();
      return dimensions;
    }
    return { width: 0, height: 0 };
  } catch (error) {
    console.warn('[image] Could not get image dimensions:', error);
    return { width: 0, height: 0 };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
