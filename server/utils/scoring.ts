import type { RuleFinding, Severity } from '../models/rule';

const severityScore: Record<Severity, number> = {
  LOW: 0.5,      // Minor issues, cosmetic
  MEDIUM: 1,     // Best-practice violations
  HIGH: 3,       // Significant security risks
  CRITICAL: 5,   // Severe vulnerabilities
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
    overallScore: Math.round(totalScore * 10) / 10,  // keep one decimal
    overallRisk: severitiesOrder[maxSeverityIndex],
  };
}
