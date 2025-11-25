import { Severity, RuleFinding } from '../models/rule';

export function severityToScore(severity: Severity): number {
  switch (severity) {
    case 'LOW':
      return 1;
    case 'MEDIUM':
      return 3;
    case 'HIGH':
      return 7;
    case 'CRITICAL':
      return 10;
    default:
      return 0;
  }
}

export function computeFileRisk(findings: RuleFinding[]): number {
  if (findings.length === 0) {
    return 0;
  }

  const totalScore = findings.reduce((sum, finding) => {
    return sum + severityToScore(finding.severity);
  }, 0);

  return totalScore;
}

// Phase 2: Simplified scoring - will be enhanced in later phases
export function computeFileSeverity(findings: RuleFinding[]): Severity {
  if (findings.length === 0) {
    return 'LOW';
  }

  const severityOrder: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let maxSeverity: Severity = 'LOW';

  for (const finding of findings) {
    if (severityOrder.indexOf(finding.severity) > severityOrder.indexOf(maxSeverity)) {
      maxSeverity = finding.severity;
    }
  }

  return maxSeverity;
}
