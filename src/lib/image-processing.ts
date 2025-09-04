/**
 * Image processing utilities for profile pictures
 * Handles resizing, compression, and format conversion
 */

/**
 * Resize and compress an image file to specified width with auto-scaling height
 * @param file - The original image file
 * @param targetWidth - Target width in pixels
 * @param quality - JPEG quality (0.1 to 1.0)
 * @returns Promise<File> - The processed image file
 */
export async function resizeAndCompressImage(
  file: File,
  targetWidth: number = 100,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate dimensions with fixed width and auto-scaling height
      const { width: newWidth, height: newHeight } = calculateDimensionsFixedWidth(
        img.width,
        img.height,
        targetWidth
      );

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create a new file from the blob
          const compressedFile = new File(
            [blob],
            `compressed_${file.name}`,
            {
              type: 'image/jpeg', // Always convert to JPEG for better compression
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions with fixed width and auto-scaling height
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param targetWidth - Target width in pixels
 * @returns Object with new width and height
 */
function calculateDimensionsFixedWidth(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): { width: number; height: number } {
  // Calculate aspect ratio
  const aspectRatio = originalHeight / originalWidth;
  
  // Calculate height based on target width and aspect ratio
  const newWidth = targetWidth;
  const newHeight = targetWidth * aspectRatio;

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Calculate new dimensions while maintaining aspect ratio (legacy function)
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns Object with new width and height
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  let newWidth = maxWidth;
  let newHeight = maxHeight;

  // Determine which dimension to constrain based on aspect ratio
  if (originalWidth > originalHeight) {
    // Landscape orientation - constrain by width
    newHeight = newWidth / aspectRatio;
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
  } else {
    // Portrait or square orientation - constrain by height
    newWidth = newHeight * aspectRatio;
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Validate if a file is a valid image
 * @param file - File to validate
 * @returns boolean
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Get human readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
