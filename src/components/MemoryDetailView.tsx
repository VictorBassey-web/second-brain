import React from 'react';
import { Memory } from '../types'; // Assuming Summary interface is in types.ts

interface MemoryDetailViewProps {
  memory: Memory;
  onBack: () => void;
}

const MemoryDetailView: React.FC<MemoryDetailViewProps> = ({ memory, onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">Back to List</button>
      <h2 className="text-xl font-bold mb-2">{memory.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{new Date(memory.timestamp).toLocaleString()}</p>

      <h3 className="text-lg font-semibold mb-2">AI Summary:</h3>
      <p className="mb-4">{memory.summary}</p>

      {memory.content && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Original Content:</h3>
          <p className="text-sm text-gray-700 line-clamp-6">{memory.content}</p>
          {/* Consider adding a way to expand/view full original content if needed */}
        </div>
      )}

      <a href={memory.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline block mb-4">Read original article</a>
      <div className="flex flex-wrap gap-2">
        {memory.tags.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MemoryDetailView; 