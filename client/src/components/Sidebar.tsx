import { useState } from 'react';
import type { ScanReportWithInsights, Severity, ConfigType } from '../types/report';

function AISummaryCollapsible({ summary, isDarkMode }: { summary: string; isDarkMode: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200;
  const needsTruncation = summary.length > maxLength;
  const displayText = needsTruncation && !isExpanded 
    ? summary.slice(0, maxLength) + '...' 
    : summary;

  return (
    <div className="space-y-3">
      <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
        isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
      }`}>
        <span>🤖</span>
        AI Overview
      </h2>
      <div className={`p-4 rounded-lg border ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
      }`}>
        <p className={`text-xs leading-relaxed whitespace-pre-line ${
          isDarkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          {displayText}
        </p>
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-xs font-medium transition-colors ${
              isDarkMode 
                ? 'text-cyan-400 hover:text-cyan-300' 
                : 'text-cyan-600 hover:text-cyan-700'
            }`}
          >
            {isExpanded ? '▲ Show less' : '▼ Show more'}
          </button>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  report: ScanReportWithInsights | null;
  selectedSeverities: Severity[];
  onSeverityToggle: (severity: Severity) => void;
  selectedConfigTypes: ConfigType[];
  onConfigTypeToggle: (configType: ConfigType) => void;
  isDarkMode: boolean;
}

const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const configTypes: ConfigType[] = ['docker', 'kubernetes', 'nginx'];

export default function Sidebar({
  report,
  selectedSeverities,
  onSeverityToggle,
  selectedConfigTypes,
  onConfigTypeToggle,
  isDarkMode,
}: SidebarProps) {
  if (!report) {
    return (
      <aside className="w-80 border-r border-slate-800 bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">⏳</div>
          <p className="text-slate-400">Loading report...</p>
        </div>
      </aside>
    );
  }

  const severityCounts = report.files.reduce(
    (acc, file) => {
      acc[file.overallRisk] = (acc[file.overallRisk] || 0) + 1;
      return acc;
    },
    {} as Record<Severity, number>
  );

  const configTypeCounts = report.files.reduce(
    (acc, file) => {
      acc[file.configType] = (acc[file.configType] || 0) + 1;
      return acc;
    },
    {} as Record<ConfigType, number>
  );

  const bgClass = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200';
  const borderClass = isDarkMode ? 'border-slate-800' : 'border-gray-200';

  return (
    <aside className={`w-80 border-r ${bgClass} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b ${borderClass}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 
                        flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 
                         bg-clip-text text-transparent">
              Config Scan
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Security Dashboard
            </p>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg border ${
          isDarkMode 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-gray-100 border-gray-300'
        }`}>
          <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>
            Scanned At
          </div>
          <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
            {new Date(report.scannedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 space-y-6">
          {/* AI Summary */}
          {report.overallSummary && (
            <AISummaryCollapsible summary={report.overallSummary} isDarkMode={isDarkMode} />
          )}

          {/* Stats */}
          <div className="space-y-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Statistics
            </h2>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-slate-900/50 border-slate-800' 
                  : 'bg-gray-100 border-gray-300'
              }`}>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Total Files
                </span>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                  {report.files.length}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-slate-900/50 border-slate-800' 
                  : 'bg-gray-100 border-gray-300'
              }`}>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Total Findings
                </span>
                <span className="text-lg font-bold text-amber-500">
                  {report.files.reduce((sum, f) => sum + f.findings.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Level Filters */}
          <div className="space-y-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Filter by Risk
            </h2>
            <div className="space-y-2">
              {severities.map((severity) => {
                const count = severityCounts[severity] || 0;
                const isSelected = selectedSeverities.includes(severity);
                const colors = {
                  LOW: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
                  MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                  HIGH: 'border-red-500/30 bg-red-500/10 text-red-300',
                  CRITICAL: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300',
                };

                return (
                  <button
                    key={severity}
                    onClick={() => onSeverityToggle(severity)}
                    disabled={count === 0}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg border
                      transition-all duration-200
                      ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}
                      ${
                        isSelected && count > 0
                          ? colors[severity]
                          : isDarkMode
                            ? 'border-slate-800 bg-slate-900/30 text-slate-400'
                            : 'border-gray-300 bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <span className="text-xs font-semibold uppercase">{severity}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Config Type Filters */}
          <div className="space-y-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Filter by Type
            </h2>
            <div className="space-y-2">
              {configTypes.map((type) => {
                const count = configTypeCounts[type] || 0;
                const isSelected = selectedConfigTypes.includes(type);
                const icons = {
                  docker: '🐳',
                  kubernetes: '☸️',
                  nginx: '⚙️',
                };

                return (
                  <button
                    key={type}
                    onClick={() => onConfigTypeToggle(type)}
                    disabled={count === 0}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg border
                      transition-all duration-200
                      ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}
                      ${
                        isSelected && count > 0
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600'
                          : isDarkMode
                            ? 'border-slate-800 bg-slate-900/30 text-slate-400'
                            : 'border-gray-300 bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <span className="text-base">{icons[type]}</span>
                      {type}
                    </span>
                    <span className="text-sm font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${
        isDarkMode 
          ? 'border-slate-800 bg-slate-950' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className={`text-xs text-center ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>
          Powered by <span className="text-cyan-500 font-semibold">Gemini AI</span>
        </div>
      </div>
    </aside>
  );
}

