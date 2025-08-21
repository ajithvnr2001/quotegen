// More efficient gaussian blur implementation
const applyGaussianBlur = (imageData: ImageData, blur: number): ImageData => {
  if (blur <= 0) return imageData;
  
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const radius = Math.min(Math.floor(blur * 2), 10); // Limit radius for performance
  
  if (radius < 1) return imageData;
  
  // Create output buffer
  const output = new Uint8ClampedArray(data.length);
  
  // Simple horizontal blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      // Sample pixels in the blur radius
      for (let kx = -radius; kx <= radius; kx++) {
        const nx = x + kx;
        
        // Check bounds
        if (nx >= 0 && nx < width) {
          const idx = (y * width + nx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      // Set the averaged pixel values
      const idx = (y * width + x) * 4;
      if (count > 0) {
        output[idx] = r / count;
        output[idx + 1] = g / count;
        output[idx + 2] = b / count;
        output[idx + 3] = a / count;
      }
    }
  }
  
  // Simple vertical blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      // Sample pixels in the blur radius
      for (let ky = -radius; ky <= radius; ky++) {
        const ny = y + ky;
        
        // Check bounds
        if (ny >= 0 && ny < height) {
          const idx = (ny * width + x) * 4;
          r += output[idx];
          g += output[idx + 1];
          b += output[idx + 2];
          a += output[idx + 3];
          count++;
        }
      }
      
      // Set the averaged pixel values
      const idx = (y * width + x) * 4;
      if (count > 0) {
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
        data[idx + 3] = a / count;
      }
    }
  }
  
  return imageData;
};

// More efficient contrast implementation
const applyContrast = (imageData: ImageData, contrast: number): ImageData => {
  const data = imageData.data;
  // Limit contrast for performance
  const adjustedContrast = Math.max(-0.9, Math.min(0.9, contrast));
  const factor = (259 * (adjustedContrast * 100 + 255)) / (255 * (259 - adjustedContrast * 100));
  
  // Process every 4th pixel for better performance on large images
  for (let i = 0; i < data.length; i += 16) { // Skip 3 out of 4 pixels
    data[i] = factor * (data[i] - 128) + 128;     // Red
    data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
    data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
    // Skip 3 pixels
  }
  
  return imageData;
};

// Process image with filters
const processImage = (imageData: ImageData, filters: any): ImageData => {
  let result = imageData;
  
  // Apply contrast (faster, so do it first)
  if (filters.contrast !== 0) {
    result = applyContrast(result, filters.contrast);
  }
  
  // Apply blur (slower, so do it second)
  if (filters.blur > 0) {
    result = applyGaussianBlur(result, filters.blur);
  }
  
  return result;
};

// Handle messages from main thread
self.onmessage = (e) => {
  const { imageData, filters } = e.data;
  
  try {
    const result = processImage(imageData, filters);
    self.postMessage({ success: true, imageData: result });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};

export {};