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

// Phase 8A: LLM Enrichment Types
export interface FileInsight {
  path: string;
  configType: ConfigType;
  overallRisk: Severity;
  overallScore: number;
  summary: string;          // LLM-generated summary
  suggestions: string[];    // LLM improvement suggestions
}

export interface ScanReportWithInsights extends ScanReport {
  overallSummary: string;   // LLM global summary
  insights: FileInsight[];  // Per-file insight blocks
}

// Deprecated - kept for backward compatibility
export interface LlmInsight {
  summary: string;
  keyRisks: string[];
  recommendations: string[];
}
