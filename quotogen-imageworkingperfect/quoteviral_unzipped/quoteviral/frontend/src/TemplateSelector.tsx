import React, { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  dimensions: string;
  tags: string[];
  createdAt: string;
}

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, selectedLanguage]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates?category=${selectedCategory}&language=${selectedLanguage}`);
      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'motivational', name: 'Motivational' },
    { id: 'aesthetic', name: 'Aesthetic' },
    { id: 'memes', name: 'Memes' },
    { id: 'business', name: 'Business' },
    { id: 'inspirational', name: 'Inspirational' }
  ];

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Spanish' },
    { id: 'fr', name: 'French' },
    { id: 'hi', name: 'Hindi' }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Template Library</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="bg-gray-100 h-24 flex items-center justify-center">
                  <div className="text-gray-400">Template Preview</div>
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-900 truncate">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;