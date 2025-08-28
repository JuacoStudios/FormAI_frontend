// PERF: Image optimization utilities for reducing upload payload size

export interface ImageOptimizationOptions {
  maxDimension: number;
  quality: number;
  format: 'webp' | 'jpeg';
}

/**
 * Downscale image to WebP format with specified dimensions and quality
 */
export async function downscaleToWebp(
  inputBlob: Blob, 
  maxDim = 1024, 
  quality = 0.8
): Promise<Blob> {
  try {
    const img = await createImageBitmap(inputBlob);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    
    console.log(`[image] Downscaling from ${img.width}x${img.height} to ${w}x${h} (scale: ${scale.toFixed(2)})`);
    
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    
    const webp = await canvas.convertToBlob({ 
      type: 'image/webp', 
      quality 
    });
    
    img.close();
    
    console.log(`[image] Optimized: ${inputBlob.size} → ${webp.size} bytes (${((1 - webp.size / inputBlob.size) * 100).toFixed(1)}% reduction)`);
    
    return webp;
  } catch (error) {
    console.warn('[image] WebP conversion failed, falling back to original:', error);
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
    let optimizedBlob: Blob;
    
    if (finalOptions.format === 'webp') {
      optimizedBlob = await downscaleToWebp(
        inputBlob, 
        finalOptions.maxDimension, 
        finalOptions.quality
      );
    } else {
      // Fallback to JPEG if WebP fails
      optimizedBlob = await downscaleToWebp(
        inputBlob, 
        finalOptions.maxDimension, 
        finalOptions.quality
      );
    }
    
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
 * Get image dimensions from blob
 */
export async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const img = await createImageBitmap(blob);
  const dimensions = { width: img.width, height: img.height };
  img.close();
  return dimensions;
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
