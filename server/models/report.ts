import type { ConfigType, RuleFinding, Severity } from './rule';

export interface FileReport {
  path: string;
  configType: ConfigType;
  findings: RuleFinding[];
  overallScore: number;
  overallRisk: Severity;
}

export interface ScanReport {
  files: FileReport[];
  scannedAt: string;
}

// For later phases
export interface LlmInsight {
  summary: string;
  keyRisks: string[];
  recommendations: string[];
}
