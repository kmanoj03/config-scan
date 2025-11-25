import fs from 'fs/promises';
import path from 'path';
import type { ScanReport } from '../models/report';
import type { Severity } from '../models/rule';

const FAILING_SEVERITIES: Severity[] = ['HIGH', 'CRITICAL'];

async function loadReport(reportPath: string): Promise<ScanReport> {
  const resolved = path.resolve(reportPath);
  const content = await fs.readFile(resolved, 'utf-8');
  return JSON.parse(content) as ScanReport;
}

function hasBlockingFindings(report: ScanReport): boolean {
  for (const file of report.files) {
    if (FAILING_SEVERITIES.includes(file.overallRisk)) {
      return true;
    }
  }
  return false;
}

async function main() {
  const reportPath = process.argv[2] ?? './reports/report.json';

  try {
    const report = await loadReport(reportPath);

    const blocking = report.files.filter(file =>
      FAILING_SEVERITIES.includes(file.overallRisk)
    );

    if (blocking.length > 0) {
      console.error('❌ config-scan: Blocking findings detected.');
      console.error('');
      for (const file of blocking) {
        console.error(
          `  - ${file.path} (type=${file.configType}, risk=${file.overallRisk}, score=${file.overallScore})`
        );
        console.error(`    Findings: ${file.findings.length}`);
        for (const finding of file.findings) {
          console.error(`      • [${finding.severity}] ${finding.id}`);
        }
        console.error('');
      }
      console.error(`Total files with HIGH/CRITICAL risk: ${blocking.length}`);
      process.exitCode = 1;
      return;
    }

    console.log('✅ config-scan: No HIGH/CRITICAL findings. CI check passed.');
    process.exitCode = 0;
  } catch (err) {
    console.error('❌ config-scan: Failed to read or parse report JSON:', err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  // Only run main when executed directly: `node dist/utils/ciCheck.js ...`
  main();
}

