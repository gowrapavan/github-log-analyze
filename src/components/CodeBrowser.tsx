'use client';

import { useState, useEffect } from 'react';

export default function CodeBrowser({ owner, repo }: { owner: string, repo: string }) {
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data whenever the path changes
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/repo/contents?owner=${owner}&repo=${repo}&path=${currentPath}`);
        const data = await res.json();
        setContents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch folder contents", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [owner, repo, currentPath]);

  // Handle navigating up the folder tree
  const handleNavigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop(); // Remove the current folder
    setCurrentPath(parts.join('/'));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      
      {/* Breadcrumb Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-2 text-sm font-mono text-gray-600 overflow-x-auto">
        <button 
          onClick={() => setCurrentPath('')}
          className="hover:text-blue-600 transition-colors font-semibold"
        >
          {repo}
        </button>
        {currentPath && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{currentPath}</span>
          </>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            
            {/* Back Button (if not at root) */}
            {currentPath !== '' && (
              <li 
                onClick={handleNavigateUp}
                className="p-3 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition-colors text-gray-500 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                <span className="text-sm font-medium">..</span>
              </li>
            )}

            {/* Files and Folders */}
            {contents.map((item) => (
              <li 
                key={item.sha} 
                onClick={() => item.type === 'dir' && setCurrentPath(item.path)}
                className={`p-3 flex items-center justify-between text-sm transition-colors ${item.type === 'dir' ? 'cursor-pointer hover:bg-gray-50' : 'text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  {item.type === 'dir' ? (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  )}
                  <span className={`font-mono ${item.type === 'dir' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {item.size > 0 ? `${(item.size / 1024).toFixed(1)} KB` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}