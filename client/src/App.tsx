import { useState, useEffect, useMemo } from 'react';
import type { ScanReportWithInsights, FileWithInsight, Severity, ConfigType } from './types/report';
import Sidebar from './components/Sidebar';
import FiltersBar from './components/FiltersBar';
import FileCard from './components/FileCard';
import InsightsPanel from './components/InsightsPanel';

export default function App() {
  const [report, setReport] = useState<ScanReportWithInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedConfigTypes, setSelectedConfigTypes] = useState<ConfigType[]>([]);
  
  // Selection
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // Load report
  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch('/report-llm.json');
        if (!res.ok) {
          throw new Error(`Failed to load report: ${res.statusText}`);
        }
        const data: ScanReportWithInsights = await res.json();
        setReport(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading report:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  // Merge files with insights
  const filesWithInsights: FileWithInsight[] = useMemo(() => {
    if (!report) return [];
    
    return report.files.map((file) => {
      const insight = report.insights.find((ins) => ins.path === file.path) || null;
      return { ...file, insight };
    });
  }, [report]);

  // Apply filters
  const filteredFiles = useMemo(() => {
    let result = filesWithInsights;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((file) => file.path.toLowerCase().includes(searchLower));
    }

    // Severity filter
    if (selectedSeverities.length > 0) {
      result = result.filter((file) => selectedSeverities.includes(file.overallRisk));
    }

    // Config type filter
    if (selectedConfigTypes.length > 0) {
      result = result.filter((file) => selectedConfigTypes.includes(file.configType));
    }

    return result;
  }, [filesWithInsights, search, selectedSeverities, selectedConfigTypes]);

  // Selected file
  const selectedFile = useMemo(
    () => filteredFiles.find((f) => f.path === selectedFilePath) || null,
    [filteredFiles, selectedFilePath]
  );

  // Toggle filters
  const toggleSeverity = (severity: Severity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    );
  };

  const toggleConfigType = (configType: ConfigType) => {
    setSelectedConfigTypes((prev) =>
      prev.includes(configType) ? prev.filter((t) => t !== configType) : [...prev, configType]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🔍</div>
          <div className="text-slate-400">
            <p className="text-xl font-medium">Loading security report...</p>
            <p className="text-sm mt-2">Analyzing configuration files</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <div className="text-slate-300">
            <p className="text-xl font-medium text-red-400">Failed to load report</p>
            <p className="text-sm mt-2 text-slate-400">{error}</p>
            <p className="text-xs mt-4 text-slate-500">
              Make sure <code className="px-2 py-1 bg-slate-800 rounded">report-llm.json</code> exists in the{' '}
              <code className="px-2 py-1 bg-slate-800 rounded">public/</code> folder
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-50' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <Sidebar
        report={report}
        selectedSeverities={selectedSeverities}
        onSeverityToggle={toggleSeverity}
        selectedConfigTypes={selectedConfigTypes}
        onConfigTypeToggle={toggleConfigType}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                Configuration Files
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>
                {filteredFiles.length} of {filesWithInsights.length} files
                {(selectedSeverities.length > 0 || selectedConfigTypes.length > 0 || search) && ' (filtered)'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 border-slate-700 hover:border-slate-600'
                    : 'text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              {/* Clear Filters */}
              {(selectedSeverities.length > 0 || selectedConfigTypes.length > 0 || search) && (
                <button
                  onClick={() => {
                    setSelectedSeverities([]);
                    setSelectedConfigTypes([]);
                    setSearch('');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? 'text-slate-400 hover:text-slate-200 border-slate-700 hover:border-slate-600'
                      : 'text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            selectedSeverities={selectedSeverities}
            onSeverityToggle={toggleSeverity}
            selectedConfigTypes={selectedConfigTypes}
            onConfigTypeToggle={toggleConfigType}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Files Grid */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin p-6 ${
          isDarkMode ? '' : 'bg-gray-50'
        }`}>
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-6xl opacity-20">📁</div>
              <div className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                <p className="text-lg font-medium">No files found</p>
                <p className="text-sm mt-2">Try adjusting your filters or search query</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.path}
                  file={file}
                  isSelected={selectedFilePath === file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Insights */}
      <aside className={`w-96 border-l overflow-hidden ${
        isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'
      }`}>
        <div className="h-full flex flex-col">
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${
              isDarkMode ? 'text-slate-200' : 'text-gray-900'
            }`}>
              <span>✨</span>
              AI Insights
            </h2>
          </div>
          <InsightsPanel selectedFile={selectedFile} isDarkMode={isDarkMode} />
        </div>
      </aside>
    </div>
  );
}

