export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfigType = 'docker' | 'kubernetes' | 'nginx';

export interface RuleFinding {
  id: string;
  configType: ConfigType;
  severity: Severity;
  description: string;
  recommendation: string;
  lineHint?: number;
  // Industry standards mappings
  cis?: string;
  cweId?: string;
  owasp?: string;
  nsa?: string;
}

export interface FileReport {
  path: string;
  configType: ConfigType;
  findings: RuleFinding[];
  overallScore: number;
  overallRisk: Severity;
}

export interface FileInsight {
  path: string;
  configType: ConfigType;
  overallRisk: Severity;
  overallScore: number;
  summary: string;
  suggestions: string[];
}

export interface ScanReportWithInsights {
  files: FileReport[];
  scannedAt: string;
  overallSummary: string;
  insights: FileInsight[];
}

export interface FileWithInsight extends FileReport {
  insight: FileInsight | null;
}

