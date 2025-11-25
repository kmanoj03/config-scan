import type { FileWithInsight } from '../types/report';
import SeverityBadge from './SeverityBadge';

interface InsightsPanelProps {
  selectedFile: FileWithInsight | null;
  isDarkMode: boolean;
}

export default function InsightsPanel({ selectedFile, isDarkMode }: InsightsPanelProps) {
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-gray-600';
  
  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="text-6xl opacity-20">📊</div>
        <div className={textSecondary}>
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm mt-2">Click on a file card to view AI-powered insights</p>
        </div>
      </div>
    );
  }

  const { insight } = selectedFile;

  if (!insight) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="text-6xl opacity-20">🤖</div>
        <div className="text-slate-400">
          <p className="text-lg font-medium">No AI insights available</p>
          <p className="text-sm mt-2">
            Run the scan with <code className="px-2 py-1 bg-slate-800 rounded">--llm</code> flag
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="space-y-6 p-6">
        {/* File Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`text-lg font-semibold break-all leading-tight ${
              isDarkMode ? 'text-slate-200' : 'text-gray-900'
            }`}>
              {selectedFile.path.split('/').pop()}
            </h2>
            <span className="text-2xl flex-shrink-0">
              {selectedFile.configType === 'docker' && '🐳'}
              {selectedFile.configType === 'kubernetes' && '☸️'}
              {selectedFile.configType === 'nginx' && '⚙️'}
            </span>
          </div>
          
          <div className={`text-xs font-mono break-all ${
            isDarkMode ? 'text-slate-500' : 'text-gray-600'
          }`}>
            {selectedFile.path}
          </div>

          <div className="flex items-center gap-3">
            <SeverityBadge severity={insight.overallRisk} size="md" isDarkMode={isDarkMode} />
            <div className={`px-3 py-1 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-gray-100 border-gray-300'
            }`}>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Score:{' '}
              </span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                {insight.overallScore}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800" />

        {/* Deterministic Rule Findings */}
        {selectedFile.findings.length > 0 && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-purple-900/20 border-purple-500/30' 
                : 'bg-purple-50 border-purple-300'
            }`}>
              <span className="text-xl">⚙️</span>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Rule Engine Findings ({selectedFile.findings.length})
              </h3>
            </div>
            <div className={`p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-purple-900/10 border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-200'
            }`}>
              <p className={`text-xs mb-3 italic ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Deterministic security rules detected the following issues:
              </p>
              <div className="space-y-3">
                {selectedFile.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border space-y-3 ${
                    isDarkMode 
                      ? 'bg-slate-900/70 border-slate-800' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {/* Header: Rule ID + Badge */}
                  <div className="flex items-start gap-3">
                    <code className={`text-xs font-mono flex-1 break-all ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {finding.id}
                    </code>
                    <div className="flex-shrink-0">
                      <SeverityBadge severity={finding.severity} size="sm" isDarkMode={isDarkMode} />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {finding.description}
                  </p>
                  
                  {/* Recommendation */}
                  <div className={`pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Fix:{' '}
                      </span>
                      {finding.recommendation}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-800" />

        {/* AI-Generated Insights */}
        <div className="space-y-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-cyan-900/20 border-cyan-500/30' 
              : 'bg-cyan-50 border-cyan-300'
          }`}>
            <span className="text-xl">🤖</span>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
            }`}>
              AI-Generated Insights
            </h3>
          </div>
          
          {/* AI Summary */}
          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-cyan-900/10 border-cyan-500/20' 
              : 'bg-cyan-50/50 border-cyan-200'
          }`}>
            <p className={`text-xs mb-3 italic ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Gemini AI analyzed the findings and generated this summary:
            </p>
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800/50 border-slate-700/50' 
                : 'bg-gradient-to-br from-gray-50 to-white border-gray-300'
            }`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {insight.summary}
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          {insight.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <span className="text-lg">💡</span>
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  AI Recommendations
                </h4>
              </div>
              <div className="space-y-2">
                {insight.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={`group p-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-900/50 border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50' 
                        : 'bg-amber-50/50 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full text-xs font-bold 
                                       flex items-center justify-center border group-hover:scale-110 transition-transform ${
                        isDarkMode 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'bg-amber-100 text-amber-700 border-amber-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

