import { FileReport, OverallReport } from '../models/report';
import { computeOverallReport } from '../utils/scoring';

export type ReportFormat = 'console' | 'json' | 'markdown';

export function buildOverallReport(
  rootPath: string,
  files: FileReport[]
): OverallReport {
  return computeOverallReport(rootPath, files);
}

export function printReport(report: OverallReport, format: ReportFormat): void {
  switch (format) {
    case 'console':
      printConsoleReport(report);
      break;
    case 'json':
      console.log(JSON.stringify(report, null, 2));
      break;
    case 'markdown':
      printMarkdownReport(report);
      break;
    default:
      console.error(`Unknown format: ${format}`);
  }
}

function printConsoleReport(report: OverallReport): void {
  console.log('\n=== Config Scan Report ===');
  console.log(`Root Path: ${report.rootPath}`);
  console.log(`Files Scanned: ${report.files.length}`);
  console.log(`Total Findings: ${report.totalFindings}`);
  console.log(`Max Severity: ${report.maxSeverity || 'None'}`);
  console.log(`Overall Risk Score: ${report.overallRiskScore}`);
  console.log('==========================\n');
}

function printMarkdownReport(report: OverallReport): void {
  console.log('# Config Scan Report\n');
  console.log(`**Root Path:** ${report.rootPath}\n`);
  console.log(`**Files Scanned:** ${report.files.length}\n`);
  console.log(`**Total Findings:** ${report.totalFindings}\n`);
  console.log(`**Max Severity:** ${report.maxSeverity || 'None'}\n`);
  console.log(`**Overall Risk Score:** ${report.overallRiskScore}\n`);
}

