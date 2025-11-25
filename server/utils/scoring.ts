import { Severity, RuleFinding } from '../models/rule';
import { FileReport, OverallReport } from '../models/report';

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

export function computeOverallReport(
  rootPath: string,
  fileReports: FileReport[]
): OverallReport {
  let totalFindings = 0;
  let maxSeverity: Severity | null = null;
  let overallRiskScore = 0;

  const severityOrder: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  for (const fileReport of fileReports) {
    totalFindings += fileReport.findings.length;
    overallRiskScore += fileReport.riskScore;

    for (const finding of fileReport.findings) {
      if (
        maxSeverity === null ||
        severityOrder.indexOf(finding.severity) > severityOrder.indexOf(maxSeverity)
      ) {
        maxSeverity = finding.severity;
      }
    }
  }

  return {
    rootPath,
    files: fileReports,
    totalFindings,
    maxSeverity,
    overallRiskScore,
  };
}

