import type { RuleFinding, Severity } from '../models/rule';

const severityScore: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 7,
  CRITICAL: 10,
};

export function scoreFindings(findings: RuleFinding[]): {
  overallScore: number;
  overallRisk: Severity;
} {
  if (findings.length === 0) {
    // Convention: no findings = LOW risk, score 0
    return {
      overallScore: 0,
      overallRisk: 'LOW',
    };
  }

  const severitiesOrder: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  let maxSeverityIndex = 0;
  let totalScore = 0;

  for (const finding of findings) {
    const idx = severitiesOrder.indexOf(finding.severity);
    if (idx > maxSeverityIndex) {
      maxSeverityIndex = idx;
    }

    totalScore += severityScore[finding.severity] ?? 0;
  }

  return {
    overallScore: totalScore,
    overallRisk: severitiesOrder[maxSeverityIndex],
  };
}
