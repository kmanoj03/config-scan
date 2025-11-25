import type { Severity } from '../types/report';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
}

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
}

export default function SeverityBadge({ severity, size = 'md', isDarkMode = true }: SeverityBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const severityConfig = {
    LOW: {
      dark: {
        bg: 'bg-blue-500/20 border-blue-500/50',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/20',
      },
      light: {
        bg: 'bg-blue-100 border-blue-400',
        text: 'text-blue-700',
        glow: 'shadow-blue-200',
      },
      icon: '🟢',
    },
    MEDIUM: {
      dark: {
        bg: 'bg-amber-500/20 border-amber-500/50',
        text: 'text-amber-300',
        glow: 'shadow-amber-500/20',
      },
      light: {
        bg: 'bg-amber-100 border-amber-400',
        text: 'text-amber-800',
        glow: 'shadow-amber-200',
      },
      icon: '🟡',
    },
    HIGH: {
      dark: {
        bg: 'bg-red-500/20 border-red-500/50',
        text: 'text-red-300',
        glow: 'shadow-red-500/20',
      },
      light: {
        bg: 'bg-red-100 border-red-400',
        text: 'text-red-700',
        glow: 'shadow-red-200',
      },
      icon: '🔴',
    },
    CRITICAL: {
      dark: {
        bg: 'bg-fuchsia-500/20 border-fuchsia-500/50 animate-pulse-slow',
        text: 'text-fuchsia-300',
        glow: 'shadow-fuchsia-500/30 shadow-lg',
      },
      light: {
        bg: 'bg-fuchsia-100 border-fuchsia-500 animate-pulse-slow',
        text: 'text-fuchsia-800',
        glow: 'shadow-fuchsia-300 shadow-lg',
      },
      icon: '🔥',
    },
  };

  const config = severityConfig[severity];
  const theme = isDarkMode ? config.dark : config.light;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider
        rounded-full border ${theme.bg} ${theme.text} ${theme.glow}
        ${sizeClasses[size]}
        transition-all duration-200 hover:scale-105
      `}
    >
      <span className="text-base leading-none">{config.icon}</span>
      {severity}
    </span>
  );
}

