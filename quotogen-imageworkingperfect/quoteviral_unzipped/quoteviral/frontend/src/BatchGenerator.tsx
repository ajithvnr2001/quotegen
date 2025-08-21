import React, { useState } from 'react';

interface BatchGeneratorProps {
  onClose: () => void;
  onGenerate: (quotes: string[], settings: any) => void;
}

const BatchGenerator: React.FC<BatchGeneratorProps> = ({ onClose, onGenerate }) => {
  const [quotes, setQuotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!quotes.trim()) return;
    
    const quotesArray = quotes.split('\n').filter(q => q.trim());
    if (quotesArray.length === 0) return;
    
    setIsGenerating(true);
    
    // Mock settings - in a real app, these would come from the UI
    const settings = {
      fontId: 'default',
      fontSize: 48,
      fontColor: '#FFFFFF',
      category: 'motivational',
      overlayStyle: 'gradient'
    };
    
    onGenerate(quotesArray, settings);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Batch Generator</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Quotes (one per line)
          </label>
          <textarea
            value={quotes}
            onChange={(e) => setQuotes(e.target.value)}
            placeholder="Enter your quotes, one per line\nExample:\nDream big and dare to fail\nBelieve you can and you're halfway there"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !quotes.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate All'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchGenerator;