import React from 'react';

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

interface TextEditorPanelProps {
  selectedText: TextElement | undefined;
  updateSelectedText: (updates: Partial<TextElement>) => void;
  deleteSelectedText: () => void;
  duplicateSelectedText: () => void;
  onClose: () => void;
}

const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  selectedText,
  updateSelectedText,
  deleteSelectedText,
  duplicateSelectedText,
  onClose
}) => {
  if (!selectedText) return null;

  // Common font families
  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Palatino Linotype'
  ];

  // Font weights
  const fontWeights = [
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Bolder', value: 'bolder' },
    { label: 'Lighter', value: 'lighter' }
  ];

  // Font styles
  const fontStyles = [
    { label: 'Normal', value: 'normal' },
    { label: 'Italic', value: 'italic' }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Text Editor</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Text Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Content
          </label>
          <textarea
            value={selectedText.text}
            onChange={(e) => updateSelectedText({ text: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={selectedText.fontFamily}
            onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Font Size: {selectedText.fontSize}px
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={selectedText.fontSize}
              onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) || 48 })}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="range"
            min="1"
            max="200"
            value={selectedText.fontSize}
            onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Weight
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontWeights.map((weight) => (
              <button
                key={weight.value}
                onClick={() => updateSelectedText({ fontWeight: weight.value })}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedText.fontWeight === weight.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {weight.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => updateSelectedText({ fontStyle: style.value })}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedText.fontStyle === style.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={selectedText.fill}
              onChange={(e) => updateSelectedText({ fill: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={selectedText.fill}
              onChange={(e) => updateSelectedText({ fill: e.target.value })}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'].map((color) => (
              <button
                key={color}
                onClick={() => updateSelectedText({ fill: color })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Text Alignment - Placeholder for future implementation */}
        {/* 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alignment
          </label>
          <div className="flex space-x-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => updateSelectedText({ align: align as any })}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  (selectedText as any).align === align
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
        */}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          <button
            onClick={duplicateSelectedText}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            📋 Duplicate Text
          </button>
          
          <button
            onClick={deleteSelectedText}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            🗑️ Delete Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorPanel;