import type { FileWithInsight } from '../types/report';
import SeverityBadge from './SeverityBadge';

interface FileCardProps {
  file: FileWithInsight;
  isSelected: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

export default function FileCard({ file, isSelected, onClick, isDarkMode }: FileCardProps) {
  const configIcons = {
    docker: '🐳',
    kubernetes: '☸️',
    nginx: '⚙️',
  };

  const truncatePath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    const parts = path.split('/');
    if (parts.length <= 2) return path;
    return `.../${parts.slice(-2).join('/')}`;
  };

  const baseClasses = isDarkMode
    ? isSelected
      ? 'bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500 shadow-xl shadow-cyan-500/20'
      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:shadow-lg'
    : isSelected
      ? 'bg-gradient-to-br from-cyan-50 to-purple-50 border-cyan-500 shadow-xl shadow-cyan-500/20'
      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg';

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-5 rounded-xl border cursor-pointer
        transition-all duration-300 hover:scale-[1.02]
        ${baseClasses}
        backdrop-blur-sm
      `}
    >
      {/* Glow Effect on Hover */}
      <div
        className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isSelected ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10' : 'bg-slate-700/10'}
      `}
      />

      <div className="relative z-10 space-y-3">
        {/* Header: Path + Config Type */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-mono transition-colors truncate ${
                isDarkMode 
                  ? 'text-slate-300 group-hover:text-white' 
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}
              title={file.path}
            >
              {truncatePath(file.path)}
            </h3>
          </div>
          <span className="text-3xl flex-shrink-0">{configIcons[file.configType]}</span>
        </div>

        {/* Risk Badge + Score */}
        <div className="flex items-center justify-between gap-3">
          <SeverityBadge severity={file.overallRisk} size="md" isDarkMode={isDarkMode} />
          <div className="text-right">
            <div className={`text-sm uppercase tracking-wider font-medium ${
              isDarkMode ? 'text-slate-500' : 'text-gray-600'
            }`}>
              Score
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
              {file.overallScore}
            </div>
          </div>
        </div>

        {/* Findings Count */}
        <div className={`flex items-center justify-between text-sm pt-2 border-t ${
          isDarkMode 
            ? 'text-slate-400 border-slate-800' 
            : 'text-gray-600 border-gray-300'
        }`}>
          <span className="flex items-center gap-1">
            <span className="text-amber-500 text-base">⚠️</span>
            {file.findings.length} finding{file.findings.length !== 1 ? 's' : ''}
          </span>
          {file.insight && (
            <span className={`flex items-center gap-1 ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <span className="text-base">✨</span>
              AI insights
            </span>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
      )}
    </div>
  );
}

