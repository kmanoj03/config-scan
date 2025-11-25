import type { Severity, ConfigType } from '../types/report';

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSeverities: Severity[];
  onSeverityToggle: (severity: Severity) => void;
  selectedConfigTypes: ConfigType[];
  onConfigTypeToggle: (configType: ConfigType) => void;
  isDarkMode: boolean;
}

const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const configTypes: ConfigType[] = ['docker', 'kubernetes', 'nginx'];

export default function FiltersBar({
  search,
  onSearchChange,
  selectedSeverities,
  onSeverityToggle,
  selectedConfigTypes,
  onConfigTypeToggle,
  isDarkMode,
}: FiltersBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border backdrop-blur-sm ${
      isDarkMode ? 'bg-slate-900/50 border-slate-800/50' : 'bg-white border-gray-200'
    }`}>
      {/* Search */}
      <div className="flex-1 min-w-[240px]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search file paths..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full px-4 py-3 pl-11 text-base rounded-lg transition-all duration-200
                     focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                       isDarkMode
                         ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                         : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                     }`}
          />
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${
            isDarkMode ? 'text-slate-500' : 'text-gray-400'
          }`}>
            🔍
          </span>
        </div>
      </div>

      {/* Severity Filters */}
      <div className="flex items-center gap-2">
        <span className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Risk:
        </span>
        {severities.map((sev) => {
          const isSelected = selectedSeverities.includes(sev);
          const colors = {
            LOW: 'border-blue-500 bg-blue-500/20 text-blue-300',
            MEDIUM: 'border-amber-500 bg-amber-500/20 text-amber-300',
            HIGH: 'border-red-500 bg-red-500/20 text-red-300',
            CRITICAL: 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-300',
          };

          return (
            <button
              key={sev}
              onClick={() => onSeverityToggle(sev)}
              className={`
                px-4 py-1.5 text-sm font-semibold uppercase rounded-full border
                transition-all duration-200 hover:scale-105
                ${
                  isSelected
                    ? colors[sev]
                    : isDarkMode
                      ? 'border-slate-700 bg-slate-800/50 text-slate-500 hover:text-slate-300'
                      : 'border-gray-300 bg-gray-200 text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {sev}
            </button>
          );
        })}
      </div>

      {/* Config Type Filters */}
      <div className="flex items-center gap-2">
        <span className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Type:
        </span>
        {configTypes.map((type) => {
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
              className={`
                px-4 py-1.5 text-sm font-semibold rounded-full border
                transition-all duration-200 hover:scale-105
                ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-600'
                    : isDarkMode
                      ? 'border-slate-700 bg-slate-800/50 text-slate-500 hover:text-slate-300'
                      : 'border-gray-300 bg-gray-200 text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <span className="mr-1 text-lg">{icons[type]}</span>
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

