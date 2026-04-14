export default function SettingsPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings & Integrations</h1>
        <p className="text-gray-500 mt-1">Manage your API keys and repository connections.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* GitHub Integration */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">GitHub Connection</h2>
                <p className="text-sm text-gray-500">Sync repositories and fetch CI/CD logs.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token (PAT)</label>
              <input 
                type="password" 
                value="ghp_************************************" 
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2">Token is securely loaded from your local environment variables.</p>
            </div>
            <button className="bg-white border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm">
              Force Sync Repositories
            </button>
          </div>
        </div>

        {/* AI Integration */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold font-serif text-sm">G</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Google Gemini AI</h2>
                <p className="text-sm text-gray-500">Powers the multi-agent debugging pipeline.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="password" 
                value="AIzaSy********************************" 
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2">Using model: <code className="bg-gray-100 px-1 rounded">gemini-2.5-flash</code></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}