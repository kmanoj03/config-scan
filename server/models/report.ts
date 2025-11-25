import { RuleFinding, Severity } from './rule';

export interface FileReport {
  path: string;
  configType: string;
  findings: RuleFinding[];
  riskScore: number;
}

export interface OverallReport {
  rootPath: string;
  files: FileReport[];
  totalFindings: number;
  maxSeverity: Severity | null;
  overallRiskScore: number;
}

export interface LlmInsight {
  summary: string;
  keyRisks: string[];
  recommendations: string[];
}

