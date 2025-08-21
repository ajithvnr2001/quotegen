// Advanced text overlay system with multi-language support
interface TextOverlayConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom' | 'custom';
  x?: number;
  y?: number;
  lineHeight: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  outline?: {
    color: string;
    width: number;
  };
  language: string;
}

// Language-specific font mapping
const LANGUAGE_FONTS: Record<string, string[]> = {
  en: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'],
  es: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
  fr: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
  hi: ['Noto Sans Devanagari', 'Arial', 'Helvetica'],
  de: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
  pt: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
  it: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
  ja: ['Noto Sans JP', 'Arial', 'Helvetica'],
};

// Text positioning presets
const TEXT_POSITIONS: Record<string, { x: number; y: number; alignment: string }> = {
  top: { x: 0.5, y: 0.2, alignment: 'center' },
  center: { x: 0.5, y: 0.5, alignment: 'center' },
  bottom: { x: 0.5, y: 0.8, alignment: 'center' },
};

// Apply text overlay to image using Canvas API
export async function applyTextOverlay(
  imageBuffer: ArrayBuffer,
  config: TextOverlayConfig
): Promise<ArrayBuffer> {
  // Create canvas and context
  const canvas = new OffscreenCanvas(1080, 1080);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  
  // Load image
  const img = await createImageBitmap(new Blob([imageBuffer]));
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Configure text rendering
  ctx.font = `${config.fontStyle} ${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
  ctx.fillStyle = config.color;
  ctx.textAlign = config.alignment as CanvasTextAlign;
  ctx.textBaseline = 'middle';
  
  // Apply shadow if specified
  if (config.shadow) {
    ctx.shadowColor = config.shadow.color;
    ctx.shadowBlur = config.shadow.blur;
    ctx.shadowOffsetX = config.shadow.offsetX;
    ctx.shadowOffsetY = config.shadow.offsetY;
  }
  
  // Apply outline if specified
  if (config.outline) {
    ctx.lineWidth = config.outline.width;
    ctx.strokeStyle = config.outline.color;
  }
  
  // Position text based on configuration
  let x = config.x !== undefined ? config.x : TEXT_POSITIONS[config.position]?.x * canvas.width || canvas.width / 2;
  let y = config.y !== undefined ? config.y : TEXT_POSITIONS[config.position]?.y * canvas.height || canvas.height / 2;
  
  // Handle text wrapping for long texts
  const maxWidth = canvas.width * 0.8;
  const words = config.text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  
  // Calculate total text height for vertical centering
  const totalHeight = lines.length * config.lineHeight;
  if (config.position === 'center') {
    y = (canvas.height - totalHeight) / 2 + config.lineHeight / 2;
  } else if (config.position === 'top') {
    y = config.lineHeight;
  } else if (config.position === 'bottom') {
    y = canvas.height - totalHeight;
  }
  
  // Render text lines
  lines.forEach((line, index) => {
    const lineY = y + index * config.lineHeight;
    
    // Draw outline if specified
    if (config.outline) {
      ctx.strokeText(line, x, lineY);
    }
    
    // Draw text
    ctx.fillText(line, x, lineY);
  });
  
  // Convert to ArrayBuffer
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
  return await blob.arrayBuffer();
}

// Get language-specific fonts
export function getLanguageFonts(language: string): string[] {
  return LANGUAGE_FONTS[language] || LANGUAGE_FONTS.en;
}

// Get text positioning preset
export function getTextPositionPreset(position: string): { x: number; y: number; alignment: string } {
  return TEXT_POSITIONS[position] || TEXT_POSITIONS.center;
}

// Estimate text width for a given font and size
export function estimateTextWidth(text: string, font: string, size: number): number {
  // Create temporary canvas for measurement
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  ctx.font = `${size}px ${font}`;
  return ctx.measureText(text).width;
}