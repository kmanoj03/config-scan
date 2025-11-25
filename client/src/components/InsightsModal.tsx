import { useEffect } from 'react';
import type { FileWithInsight } from '../types/report';
import SeverityBadge from './SeverityBadge';

interface InsightsModalProps {
  selectedFile: FileWithInsight | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function InsightsModal({ selectedFile, onClose, isDarkMode }: InsightsModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!selectedFile) return null;

  const { insight } = selectedFile;

  const configIcons = {
    docker: '🐳',
    kubernetes: '☸️',
    nginx: '⚙️',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-4 p-6 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <span className="text-5xl flex-shrink-0">{configIcons[selectedFile.configType]}</span>
            <div className="flex-1 min-w-0">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-slate-200' : 'text-gray-900'
              }`}>
                {selectedFile.path.split('/').pop()}
              </h2>
              <p className={`text-sm font-mono mb-3 ${
                isDarkMode ? 'text-slate-500' : 'text-gray-600'
              }`}>
                {selectedFile.path}
              </p>
              <div className="flex items-center gap-3">
                <SeverityBadge severity={selectedFile.overallRisk} size="md" isDarkMode={isDarkMode} />
                <div className={`px-3 py-1 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-300'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Score:{' '}
                  </span>
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    {selectedFile.overallScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isDarkMode
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin">
          <div className="grid grid-cols-2 gap-6 p-6">
            {/* Left Column: Rule Engine Findings */}
            <div className="space-y-4">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-purple-900/20 border-purple-500/30'
                  : 'bg-purple-50 border-purple-300'
              }`}>
                <span className="text-2xl">⚙️</span>
                <h3 className={`text-lg font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Rule Engine Findings ({selectedFile.findings.length})
                </h3>
              </div>

              {selectedFile.findings.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  No deterministic findings for this file.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedFile.findings.map((finding, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-lg border space-y-3 ${
                        isDarkMode
                          ? 'bg-slate-900/70 border-slate-800'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {/* Rule ID + Badge */}
                      <div className="flex items-start gap-3 justify-between">
                        <code className={`text-sm font-mono ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {finding.id}
                        </code>
                        <SeverityBadge severity={finding.severity} size="sm" isDarkMode={isDarkMode} />
                      </div>

                      {/* Description */}
                      <p className={`text-base leading-relaxed ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        {finding.description}
                      </p>

                      {/* Recommendation */}
                      <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                        <p className={`text-sm leading-relaxed ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          <span className={`font-semibold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Fix:{' '}
                          </span>
                          {finding.recommendation}
                        </p>
                      </div>

                      {/* Standards Badges */}
                      {(finding.cis || finding.cweId || finding.owasp || finding.nsa) && (
                        <div className="pt-3">
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                            isDarkMode ? 'text-slate-500' : 'text-gray-500'
                          }`}>
                            Industry Standards
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {finding.cis && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                isDarkMode
                                  ? 'bg-blue-900/40 text-blue-200 border-blue-500/50'
                                  : 'bg-blue-50 text-blue-800 border-blue-400'
                              }`}>
                                <span className="font-bold">CIS</span>
                                <span className="opacity-90">{finding.cis.replace('CIS ', '').replace('CIS Docker ', 'D').replace('CIS Nginx ', 'N').replace('CIS ', 'K')}</span>
                              </span>
                            )}
                            {finding.cweId && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                isDarkMode
                                  ? 'bg-orange-900/40 text-orange-200 border-orange-500/50'
                                  : 'bg-orange-50 text-orange-800 border-orange-400'
                              }`}>
                                <span className="font-bold">CWE</span>
                                <span className="opacity-90">{finding.cweId.replace('CWE-', '')}</span>
                              </span>
                            )}
                            {finding.owasp && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                isDarkMode
                                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-500/50'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              }`}>
                                <span className="font-bold">OWASP</span>
                                <span className="opacity-90">{finding.owasp.replace('ASVS ', '')}</span>
                              </span>
                            )}
                            {finding.nsa && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                isDarkMode
                                  ? 'bg-indigo-900/40 text-indigo-200 border-indigo-500/50'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-400'
                              }`}>
                                <span className="font-bold">NSA</span>
                                <span className="text-xs opacity-90">K8s</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: AI Insights */}
            {insight && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-cyan-900/20 border-cyan-500/30'
                    : 'bg-cyan-50 border-cyan-300'
                }`}>
                  <span className="text-2xl">🤖</span>
                  <h3 className={`text-lg font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
                  }`}>
                    AI-Generated Insights
                  </h3>
                </div>

                {/* AI Summary */}
                <div className={`p-5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800/50 border-slate-700/50'
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-300'
                }`}>
                  <p className={`text-base leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    {insight.summary}
                  </p>
                </div>

                {/* AI Recommendations */}
                {insight.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <h4 className={`text-base font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        AI Recommendations
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {insight.suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className={`group p-4 rounded-lg border ${
                            isDarkMode
                              ? 'bg-slate-900/50 border-slate-800'
                              : 'bg-amber-50/50 border-amber-200'
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full text-sm font-bold 
                                           flex items-center justify-center border ${
                              isDarkMode
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-amber-100 text-amber-700 border-amber-300'
                            }`}>
                              {idx + 1}
                            </span>
                            <p className={`text-base leading-relaxed ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              {suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

