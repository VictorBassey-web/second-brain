import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import MemoryDetailView from './components/MemoryDetailView';
import { Memory } from './types';

const Popup: React.FC = () => {
  const [summaries, setSummaries] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const result = await chrome.storage.local.get('memories');
      setSummaries(result.memories || []);
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSummaries = summaries.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (memory: Memory) => {
    setSelectedMemory(memory);
  };

  const handleBackClick = () => {
    setSelectedMemory(null);
  };

  return (
    <div className="w-[400px] h-[600px] bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4">
        <h1 className="text-xl font-bold">NeuroPilot</h1>
        <p className="text-sm opacity-80">Your AI-powered second brain</p>
      </div>

      {/* Conditional rendering based on selectedMemory */}
      {selectedMemory ? (
        <MemoryDetailView memory={selectedMemory} onBack={handleBackClick} />
      ) : (
        <>
          {/* Search Bar */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search your memories..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto h-[calc(100%-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No memories found</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredSummaries.map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCardClick(memory)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{memory.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{memory.summary}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {memory.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500">
                        {new Date(memory.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      {!selectedMemory && (
        <div className="absolute bottom-0 w-full p-4 bg-white border-t">
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => {
              try {
                chrome.runtime.openOptionsPage();
              } catch (error) {
                console.error('Error opening options page:', error);
              }
            }}
          >
            Settings
          </button>
        </div>
      )}
    </div>
  );
};

// Initialize the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} 