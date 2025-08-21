import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import TextEditorPanel from './TextEditorPanel';
import TemplateSelector from './TemplateSelector';
import BatchGenerator from './BatchGenerator';
import HealthMonitor from './HealthMonitor';

// Custom image processing with Web Worker
const processImageWithCustomFilters = async (image: HTMLImageElement, filters: any): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve(image);
      return;
    }
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw the original image
    ctx.drawImage(image, 0, 0);
    
    // If no filters needed, return original image
    if (filters.contrast === 0 && filters.blur === 0) {
      resolve(image);
      return;
    }
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create Web Worker
    const worker = new Worker(new URL('./imageProcessor.worker.ts', import.meta.url));
    
    // Handle worker response
    worker.onmessage = (e) => {
      const { success, imageData: processedImageData, error } = e.data;
      
      if (success && processedImageData) {
        // Put processed image data back to canvas
        ctx.putImageData(processedImageData, 0, 0);
        
        // Create new image from processed canvas
        const processedImage = new Image();
        processedImage.onload = () => {
          worker.terminate();
          resolve(processedImage);
        };
        processedImage.src = canvas.toDataURL();
      } else {
        // If processing failed, return original image
        console.error('Image processing failed:', error);
        worker.terminate();
        resolve(image);
      }
    };
    
    // Handle worker error
    worker.onerror = (error: ErrorEvent) => {
      console.error('Worker error:', error);
      worker.terminate();
      resolve(image);
    };
    
    // Send data to worker
    worker.postMessage({ imageData, filters });
  });
};
interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontWeight: string;
  fill: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width?: number;
  height?: number;
}
interface CanvasSize {
  width: number;
  height: number;
}
interface SocialMediaSize {
  name: string;
  width: number;
  height: number;
  icon: string;
}
interface ImageState {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  noise: number;
  pixelSize: number;
}

// Constants
const SOCIAL_SIZES: Record<string, SocialMediaSize> = {
  'instagram-post': { name: 'Instagram Post', width: 1080, height: 1080, icon: '📸' },
  'instagram-story': { name: 'Instagram Story', width: 1080, height: 1920, icon: '📱' },
  'facebook-post': { name: 'Facebook Post', width: 1200, height: 630, icon: '👥' },
  'twitter-post': { name: 'X Post', width: 1200, height: 675, icon: '🐦' },
  'linkedin-post': { name: 'LinkedIn Post', width: 1200, height: 627, icon: '💼' },
  'custom': { name: 'Custom Size', width: 1080, height: 1080, icon: '🎨' },
};

// Main App Component
function App() {
  // Core States
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [selectedSocialSize, setSelectedSocialSize] = useState('instagram-post');
  const [customSize] = useState({ width: 1080, height: 1080 });
  
  // Image States
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  const [imageState, setImageState] = useState<ImageState>({
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    noise: 0,
    pixelSize: 1
  });

  // Template States
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);

  // Content States
  const [textContent, setTextContent] = useState('');

  // Text States
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; textId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    textId: null
  });

  // Canvas States
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1080, height: 1080 });
  const [stageScale, setStageScale] = useState(1);
  
  // UI States
  const [showImageControls, setShowImageControls] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Initialize Data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialization code if needed
      } catch (error) {
        console.error('Failed to initialize ', error);
      }
    };
    initializeData();
  }, []);

  // Get current canvas dimensions
  const getCurrentSize = () => {
    if (selectedSocialSize === 'custom') {
      return customSize;
    }
    return {
      width: SOCIAL_SIZES[selectedSocialSize].width,
      height: SOCIAL_SIZES[selectedSocialSize].height
    };
  };

  // Update canvas size when social size changes
  useEffect(() => {
    const newSize = getCurrentSize();
    setCanvasSize(newSize);
    calculateStageScale(newSize);
  }, [selectedSocialSize, customSize]);

  // Calculate stage scale to fit viewport
  const calculateStageScale = (size: CanvasSize) => {
    const containerWidth = window.innerWidth - 20; // Minimal padding
    const containerHeight = window.innerHeight - 100; // Subtract header height and minimal padding
    const padding = 10;
    const scaleX = (containerWidth - padding) / size.width;
    const scaleY = (containerHeight - padding) / size.height;
    const scale = Math.min(scaleX, scaleY, 1.5); // Allow slight zoom in
    setStageScale(scale);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateStageScale(canvasSize);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize]);

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setUploadedImage(img);
      // Reset image state when new image is uploaded
      setImageState({
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        noise: 0,
        pixelSize: 1
      });
      // Fit image to canvas after upload
      setTimeout(() => fitImageToCanvas(), 100);
    };
    img.src = URL.createObjectURL(file);
  };

  // Update selected text element
  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (!selectedTextId) return;
    setTextElements(prev =>
      prev.map(text =>
        text.id === selectedTextId ? { ...text, ...updates } : text
      )
    );
  };

  // Delete selected text element
  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    setTextElements(prev => prev.filter(text => text.id !== selectedTextId));
    setSelectedTextId(null);
  };
  
  // Duplicate selected text element
  const duplicateSelectedText = () => {
    if (!selectedTextId) return;
    const textToDuplicate = textElements.find(text => text.id === selectedTextId);
    if (!textToDuplicate) return;
    
    const duplicatedText: TextElement = {
      ...textToDuplicate,
      id: `text_${Date.now()}`,
      x: textToDuplicate.x + 20,
      y: textToDuplicate.y + 20
    };
    
    setTextElements(prev => [...prev, duplicatedText]);
    setSelectedTextId(duplicatedText.id);
  };

  // Handle text selection
  const handleTextSelect = (textId: string) => {
    if (isLocked) return;
    setSelectedTextId(textId);
  };

  // Add new text element
  const addNewTextElement = () => {
    if (isLocked || !textContent.trim()) return;
    
    const newTextElement: TextElement = {
      id: `text_${Date.now()}`,
      text: textContent,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2,
      fontSize: 48,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fill: '#000000',
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    
    setTextElements(prev => [...prev, newTextElement]);
    setSelectedTextId(newTextElement.id);
    setTextContent(''); // Clear the input after adding
  };

  // Handle transformer
  useEffect(() => {
    if (!selectedTextId || !transformerRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const selectedNode = stage.findOne(`#${selectedTextId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedTextId]);

  // Export canvas as image
  const handleExport = async () => {
    // For now, we'll implement a simple export
    // In a full implementation, this would call the backend API
    const stage = stageRef.current;
    if (!stage) return;
    // Hide transformer during export
    if (transformerRef.current) {
      transformerRef.current.hide();
      stage.draw();
    }
    // Create a new stage for export at full resolution
    const exportStage = new Konva.Stage({
      container: document.createElement('div'),
      width: canvasSize.width,
      height: canvasSize.height,
    });
    const exportLayer = new Konva.Layer();
    exportStage.add(exportLayer);
    // Add background
    const background = new Konva.Rect({
      width: canvasSize.width,
      height: canvasSize.height,
      fill: 'white',
    });
    exportLayer.add(background);
    // Add image if exists
    if (uploadedImage) {
      const exportImage = new Konva.Image({
        image: uploadedImage,
        x: imageState.position.x,
        y: imageState.position.y,
        scaleX: imageState.scale.x,
        scaleY: imageState.scale.y,
        rotation: imageState.rotation,
      });
      
      // Add image if exists
    if (uploadedImage) {
      const imageToUse = processedImage || uploadedImage;
      
      const exportImage = new Konva.Image({
        image: imageToUse,
        x: imageState.position.x,
        y: imageState.position.y,
        scaleX: imageState.scale.x,
        scaleY: imageState.scale.y,
        rotation: imageState.rotation,
      });
      
      // Apply filters in a specific order that's known to work
      const filtersToApply = [];
      
      // Brightness
      if (imageState.brightness !== 0) {
        exportImage.brightness(imageState.brightness);
        filtersToApply.push(Konva.Filters.Brighten);
      }
      
      // Saturation (HSL)
      if (imageState.saturation !== 0) {
        exportImage.saturation(imageState.saturation);
        filtersToApply.push(Konva.Filters.HSL);
      }
      
      // Noise
      if (imageState.noise > 0) {
        filtersToApply.push(Konva.Filters.Noise);
      }
      
      // Pixelation
      if (imageState.pixelSize > 1) {
        exportImage.pixelSize(imageState.pixelSize);
        filtersToApply.push(Konva.Filters.Pixelate);
      }
      
      // Apply all filters at once
      if (filtersToApply.length > 0) {
        exportImage.filters(filtersToApply);
      }
      
      exportLayer.add(exportImage);
    }
      
      exportLayer.add(exportImage);
    }
    // Add text elements
    textElements.forEach((textElement) => {
      const exportText = new Konva.Text({
        text: textElement.text,
        x: textElement.x,
        y: textElement.y,
        fontSize: textElement.fontSize,
        fontFamily: textElement.fontFamily,
        fontStyle: textElement.fontStyle,
        fontWeight: textElement.fontWeight,
        fill: textElement.fill,
        rotation: textElement.rotation,
        scaleX: textElement.scaleX,
        scaleY: textElement.scaleY,
        width: textElement.width,
        height: textElement.height,
      });
      exportLayer.add(exportText);
    });
    exportLayer.draw();
    const dataURL = exportStage.toDataURL({
      width: canvasSize.width,
      height: canvasSize.height,
      pixelRatio: 1,
    });
    // Clean up
    exportStage.destroy();
    // Show transformer again
    if (transformerRef.current && selectedTextId) {
      transformerRef.current.show();
      stage.draw();
    }
    // Download
    const link = document.createElement('a');
    link.download = `quoteviral-${selectedSocialSize}-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export for specific platform
  const handlePlatformExport = async (platform: string) => {
    // This would call the backend API to generate platform-specific exports
    // For now, we'll just show an alert
    alert(`Exporting for ${SOCIAL_SIZES[platform]?.name || platform}... In a full implementation, this would generate optimized images for the selected platform.`);
    
    // In a real implementation, this would:
    // 1. Send the current canvas state to the backend
    // 2. Request generation of platform-specific formats
    // 3. Download the optimized images
  };

  // Get selected text element
  const selectedText = textElements.find(text => text.id === selectedTextId);

  // Image manipulation functions
  const updateImageState = (updates: Partial<ImageState>) => {
    setImageState(prev => ({ ...prev, ...updates }));
  };

  const resetImageAdjustments = () => {
    updateImageState({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      noise: 0,
      pixelSize: 1,
      rotation: 0,
      scale: { x: 1, y: 1 },
      position: { x: 0, y: 0 }
    });
    // Also reset the image position to fit canvas
    setTimeout(() => fitImageToCanvas(), 100);
  };

  const fitImageToCanvas = () => {
    if (!uploadedImage) return;
    const imageAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = canvasSize.width / canvasSize.height;
    let scale, x, y;
    if (imageAspect > canvasAspect) {
      // Image is wider - fit to height and crop width
      scale = canvasSize.height / uploadedImage.height;
      x = (canvasSize.width - uploadedImage.width * scale) / 2;
      y = 0;
    } else {
      // Image is taller - fit to width and crop height
      scale = canvasSize.width / uploadedImage.width;
      x = 0;
      y = (canvasSize.height - uploadedImage.height * scale) / 2;
    }
    updateImageState({
      position: { x, y },
      scale: { x: scale, y: scale }
    });
  };

  // Add effect to fit image when canvas size changes
  useEffect(() => {
    if (uploadedImage) {
      fitImageToCanvas();
    }
  }, [canvasSize, uploadedImage]);
  
  // Process image when filters change (with debouncing)
  useEffect(() => {
    if (!uploadedImage) return;
    
    // If no custom filters are applied, use the original image
    if (imageState.contrast === 0 && imageState.blur === 0) {
      setProcessedImage(uploadedImage);
      return;
    }
    
    // Set loading state
    setIsProcessing(true);
    
    // Debounce the image processing to prevent too many requests
    const debounceTimer = setTimeout(() => {
      // Process image with custom filters
      processImageWithCustomFilters(uploadedImage, {
        contrast: imageState.contrast,
        blur: imageState.blur
      }).then(processed => {
        setProcessedImage(processed);
        setIsProcessing(false);
      });
    }, 100); // Reduced to 100ms debounce delay
    
    return () => {
      clearTimeout(debounceTimer);
      setIsProcessing(false);
    };
  }, [uploadedImage, imageState.contrast, imageState.blur]);
  
  // Apply filters to image when image state changes
  useEffect(() => {
    if (!uploadedImage || !stageRef.current) return;
    
    const stage = stageRef.current;
    const layers = stage.getLayers();
    if (layers.length === 0) return;
    
    const layer = layers[0];
    const konvaImages = layer.find('Image');
    if (konvaImages.length > 0) {
      const konvaImage = konvaImages[0];
      
      // Clear all filters first
      konvaImage.filters([]);
      
      // Apply filters in a specific order that's known to work
      const filtersToApply = [];
      
      // Brightness
      if (imageState.brightness !== 0) {
        konvaImage.brightness(imageState.brightness);
        filtersToApply.push(Konva.Filters.Brighten);
      }
      
      // Saturation (HSL)
      if (imageState.saturation !== 0) {
        konvaImage.saturation(imageState.saturation);
        filtersToApply.push(Konva.Filters.HSL);
      }
      
      // Noise
      if (imageState.noise > 0) {
        filtersToApply.push(Konva.Filters.Noise);
      }
      
      // Pixelation
      if (imageState.pixelSize > 1) {
        konvaImage.pixelSize(imageState.pixelSize);
        filtersToApply.push(Konva.Filters.Pixelate);
      }
      
      // Apply all filters at once
      if (filtersToApply.length > 0) {
        konvaImage.filters(filtersToApply);
      }
      
      // Important: Cache the image to apply filters
      konvaImage.cache();
      
      // Force redraw with timeout to ensure it happens
      setTimeout(() => {
        layer.batchDraw();
        stage.batchDraw();
      }, 0);
    }
  }, [imageState, uploadedImage, processedImage]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">QuoteViral</h1>
          <div className="text-sm text-gray-500">Single Canvas Editor</div>
          <HealthMonitor />
        </div>
        <div className="flex items-center space-x-4">
          {/* Social Size Selector */}
          <select
            value={selectedSocialSize}
            onChange={(e) => setSelectedSocialSize(e.target.value)}
            disabled={isLocked}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
          >
            {Object.entries(SOCIAL_SIZES).map(([key, size]) => (
              <option key={key} value={key}>
                {size.icon} {size.name} ({size.width}×{size.height})
              </option>
            ))}
          </select>
          
          {/* Text Input and Add Button */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text..."
              disabled={isLocked}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNewTextElement();
                }
              }}
            />
            <button
              onClick={addNewTextElement}
              disabled={isLocked || !textContent.trim()}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              ➕ Add Text
            </button>
            <button
              onClick={() => {
                // Close image controls when opening text editor
                if (showImageControls) {
                  setShowImageControls(false);
                }
                
                // Create a temporary text element to open the editor
                const tempTextElement: TextElement = {
                  id: `temp_text_${Date.now()}`,
                  text: 'Your text here',
                  x: canvasSize.width / 2 - 100,
                  y: canvasSize.height / 2,
                  fontSize: 48,
                  fontFamily: 'Arial',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fill: '#000000',
                  rotation: 0,
                  scaleX: 1,
                  scaleY: 1
                };
                
                setTextElements(prev => [...prev, tempTextElement]);
                setSelectedTextId(tempTextElement.id);
                setShowTextEditor(true);
              }}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              📝 Add Text (Advanced)
            </button>
          </div>
          
          {/* Template Selection Button */}
          <button
            onClick={() => {
              // Close other panels when opening template selector
              if (showImageControls) setShowImageControls(false);
              if (selectedTextId) {
                setShowTextEditor(false);
                setSelectedTextId(null);
              }
              setShowTemplateSelector(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            🎨 Templates
          </button>
          
          {/* Batch Generation Button */}
          <button
            onClick={() => {
              // Close other panels when opening batch generator
              if (showImageControls) setShowImageControls(false);
              if (selectedTextId) {
                setShowTextEditor(false);
                setSelectedTextId(null);
              }
              if (showTemplateSelector) setShowTemplateSelector(false);
              setShowBatchGenerator(true);
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors"
          >
            📦 Batch Generate
          </button>
          
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isLocked}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLocked}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            📸 Upload Image
          </button>
          
          {/* Image Controls Toggle */}
          {uploadedImage && (
            <button
              onClick={() => {
                // If text editor is open, close it first
                if (selectedTextId) {
                  setShowTextEditor(false);
                }
                setShowImageControls(!showImageControls);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showImageControls
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showImageControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          )}
          
          {/* Export Button */}
          <div className="relative group">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
            >
              💾 Export
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Platform-specific export dropdown */}
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
              <button
                onClick={handleExport}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Current Format ({SOCIAL_SIZES[selectedSocialSize]?.name || 'Custom'})
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              {Object.entries(SOCIAL_SIZES).filter(([key]) => key !== selectedSocialSize).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => handlePlatformExport(key)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {size.icon} {size.name}
                </button>
              ))}
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => handlePlatformExport('print-quality')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                🖨️ Print Quality
              </button>
            </div>
          </div>
          
          {/* Clear Text Button */}
          {textElements.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all text elements?')) {
                  setTextElements([]);
                  setSelectedTextId(null);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              🧹 Clear Text
            </button>
          )}
          
          {/* Lock Toggle */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLocked
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={isLocked ? 'Click to unlock editing' : 'Click to lock editing'}
          >
            {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
          </button>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Control Panels - Only one shown at a time */}
        {uploadedImage && showImageControls && !selectedTextId && !showTemplateSelector && (
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Image Adjustments</h3>
              <button 
                onClick={() => setShowImageControls(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-blue-700 text-sm">Processing image...</span>
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Brightness: {Math.round(imageState.brightness * 100)}
                  </label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={Math.round(imageState.brightness * 100)}
                    onChange={(e) => updateImageState({ brightness: parseInt(e.target.value) / 100 })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={imageState.brightness}
                  onChange={(e) => updateImageState({ brightness: parseFloat(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contrast: {Math.round(imageState.contrast * 100)}
                  </label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={Math.round(imageState.contrast * 100)}
                    onChange={(e) => updateImageState({ contrast: parseInt(e.target.value) / 100 })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={imageState.contrast}
                  onChange={(e) => updateImageState({ contrast: parseFloat(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Saturation: {Math.round(imageState.saturation * 100)}
                  </label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={Math.round(imageState.saturation * 100)}
                    onChange={(e) => updateImageState({ saturation: parseInt(e.target.value) / 100 })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={imageState.saturation}
                  onChange={(e) => updateImageState({ saturation: parseFloat(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Blur: {Math.round(imageState.blur * 10)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={Math.round(imageState.blur * 10)}
                    onChange={(e) => updateImageState({ blur: parseInt(e.target.value) / 10 })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={imageState.blur}
                  onChange={(e) => updateImageState({ blur: parseFloat(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Noise: {Math.round(imageState.noise * 100)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(imageState.noise * 100)}
                    onChange={(e) => updateImageState({ noise: parseInt(e.target.value) / 100 })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={imageState.noise}
                  onChange={(e) => updateImageState({ noise: parseFloat(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Pixel Size: {imageState.pixelSize}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={imageState.pixelSize}
                    onChange={(e) => updateImageState({ pixelSize: parseInt(e.target.value) })}
                    disabled={isLocked}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={imageState.pixelSize}
                  onChange={(e) => updateImageState({ pixelSize: parseInt(e.target.value) })}
                  disabled={isLocked}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="pt-2">
                <button
                  onClick={fitImageToCanvas}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mb-2"
                >
                  Fit to Canvas
                </button>
                
                <button
                  onClick={resetImageAdjustments}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Reset Adjustments
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Text Editor Panel */}
        {selectedTextId && showTextEditor && !showTemplateSelector && (
          <TextEditorPanel
            selectedText={selectedText}
            updateSelectedText={updateSelectedText}
            deleteSelectedText={deleteSelectedText}
            duplicateSelectedText={duplicateSelectedText}
            onClose={() => setShowTextEditor(false)}
          />
        )}
        
        {/* Template Selector Panel */}
        {showTemplateSelector && !showBatchGenerator && (
          <TemplateSelector
            onSelectTemplate={(templateId) => {
              // Handle template selection
              console.log('Selected template:', templateId);
              setShowTemplateSelector(false);
            }}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
        
        {/* Batch Generator Panel */}
        {showBatchGenerator && (
          <BatchGenerator
            onClose={() => setShowBatchGenerator(false)}
            onGenerate={async (quotes, settings) => {
              try {
                // In a real implementation, this would call the batch API endpoint
                console.log('Generating batch:', { quotes, settings });
                
                // Mock implementation for now
                alert(`Generating ${quotes.length} quotes in batch mode!`);
                setShowBatchGenerator(false);
              } catch (error) {
                console.error('Batch generation failed:', error);
                alert('Batch generation failed. Please try again.');
              }
            }}
          />
        )}
        
        {/* Canvas Area - Now takes full width */}
        <div className="flex-1 flex items-center justify-center p-4">
          {!uploadedImage ? (
            <div className="text-center">
              <div className="w-96 h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6 bg-white">
                <div>
                  <div className="text-6xl text-gray-400 mb-4">📸</div>
                  <div className="text-gray-600 text-lg mb-2">Upload an image to get started</div>
                  <div className="text-gray-400 text-sm">Choose your canvas size and upload an image</div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Choose Image
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div 
                className="bg-white rounded-lg shadow-lg relative"
                style={{
                  width: canvasSize.width * stageScale,
                  height: canvasSize.height * stageScale,
                }}
              >
                <Stage
                  ref={stageRef}
                  width={canvasSize.width * stageScale}
                  height={canvasSize.height * stageScale}
                  scaleX={stageScale}
                  scaleY={stageScale}
                  onMouseDown={(e) => {
                    if (isLocked) return;
                    // Deselect when clicking on empty area
                    if (e.target === e.target.getStage()) {
                      setSelectedTextId(null);
                    }
                  }}
                >
                  <Layer>
                    {/* Background */}
                    <Rect
                      width={canvasSize.width}
                      height={canvasSize.height}
                      fill="white"
                    />
                    {/* Image */}
                    {uploadedImage && (
                      <KonvaImage
                        image={processedImage || uploadedImage}
                        x={imageState.position.x}
                        y={imageState.position.y}
                        scaleX={imageState.scale.x}
                        scaleY={imageState.scale.y}
                        rotation={imageState.rotation}
                        draggable={!isLocked}
                        onDragEnd={(e) => {
                          updateImageState({
                            position: { x: e.target.x(), y: e.target.y() }
                          });
                        }}
                        onDragMove={(e) => {
                          // Update image state during drag for immediate feedback
                          updateImageState({
                            position: { x: e.target.x(), y: e.target.y() }
                          });
                        }}
                        brightness={imageState.brightness}
                        saturation={imageState.saturation}
                      />
                    )}
                    {/* Text Elements */}
                    {textElements.map((textElement) => (
                      <Group
                        key={textElement.id}
                        onContextMenu={(e) => {
                          e.evt.preventDefault();
                          if (!isLocked) {
                            // Close image controls when opening text editor
                            if (showImageControls) {
                              setShowImageControls(false);
                            }
                            setContextMenu({
                              visible: true,
                              x: e.evt.clientX,
                              y: e.evt.clientY,
                              textId: textElement.id
                            });
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }
                        }}
                      >
                        <Text
                          key={textElement.id}
                          id={textElement.id}
                          text={textElement.text}
                          x={textElement.x}
                          y={textElement.y}
                          fontSize={textElement.fontSize}
                          fontFamily={textElement.fontFamily}
                          fontStyle={textElement.fontStyle}
                          fontWeight={textElement.fontWeight}
                          fill={textElement.fill}
                          rotation={textElement.rotation}
                          scaleX={textElement.scaleX}
                          scaleY={textElement.scaleY}
                          width={textElement.width}
                          height={textElement.height}
                          draggable={!isLocked}
                          onClick={() => {
                            // Close image controls when opening text editor
                            if (showImageControls) {
                              setShowImageControls(false);
                            }
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }}
                          onTap={() => {
                            // Close image controls when opening text editor
                            if (showImageControls) {
                              setShowImageControls(false);
                            }
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }}
                          onDragEnd={(e) => {
                            if (!isLocked) {
                              updateSelectedText({
                                x: e.target.x(),
                                y: e.target.y(),
                              });
                            }
                          }}
                          onTransformEnd={(e) => {
                            if (!isLocked) {
                              const node = e.target;
                              updateSelectedText({
                                x: node.x(),
                                y: node.y(),
                                rotation: node.rotation(),
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                              });
                            }
                          }}
                          // Double click to edit text directly on canvas
                          onDblClick={() => {
                            if (!isLocked) {
                              // Close image controls when opening text editor
                              if (showImageControls) {
                                setShowImageControls(false);
                              }
                              handleTextSelect(textElement.id);
                              setShowTextEditor(true);
                            }
                          }}
                        />
                      </Group>
                    ))}
                    {/* Transformer */}
                    {!isLocked && (
                      <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                          // Limit resize
                          if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                          }
                          return newBox;
                        }}
                      />
                    )}
                  </Layer>
                </Stage>
                {/* Context Menu */}
                {contextMenu.visible && (
                  <div 
                    className="absolute bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                    style={{ 
                      left: contextMenu.x, 
                      top: contextMenu.y,
                      minWidth: '180px'
                    }}
                  >
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        if (contextMenu.textId) {
                          const textElement = textElements.find(t => t.id === contextMenu.textId);
                          if (textElement) {
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }
                        }
                        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
                      }}
                    >
                      Edit Text
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        if (contextMenu.textId) {
                          const textElement = textElements.find(t => t.id === contextMenu.textId);
                          if (textElement) {
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }
                        }
                        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
                      }}
                    >
                      Change Font Size
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        if (contextMenu.textId) {
                          const textElement = textElements.find(t => t.id === contextMenu.textId);
                          if (textElement) {
                            handleTextSelect(textElement.id);
                            setShowTextEditor(true);
                          }
                        }
                        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
                      }}
                    >
                      Change Color
                    </button>
                    <hr className="my-1" />
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        duplicateSelectedText();
                        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
                      }}
                    >
                      Duplicate Text
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (contextMenu.textId) {
                          setTextElements(prev => prev.filter(text => text.id !== contextMenu.textId));
                          setSelectedTextId(null);
                        }
                        setContextMenu({ visible: false, x: 0, y: 0, textId: null });
                      }}
                    >
                      Delete Text
                    </button>
                  </div>
                )}
                {/* Click outside to close context menu */}
                {contextMenu.visible && (
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setContextMenu({ visible: false, x: 0, y: 0, textId: null })}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;