import fs from 'fs/promises';
import type { ScanReport } from '../models/report';
import type { RuleFinding } from '../models/rule';

export function printConsole(report: ScanReport): void {
  const files = report.files;
  const totalConfigs = files.length;
  const totalFindings = files.reduce((sum, f) => sum + f.findings.length, 0);

  console.log(`Scanned at: ${report.scannedAt}`);
  console.log(`Config files: ${totalConfigs}`);
  console.log(`Total findings: ${totalFindings}`);
  console.log('');

  for (const file of files) {
    console.log(`File: ${file.path}`);
    console.log(`  Type: ${file.configType}`);
    console.log(`  Overall risk: ${file.overallRisk}`);
    console.log(`  Overall score: ${file.overallScore}`);
    console.log(`  Findings: ${file.findings.length}`);

    for (const finding of file.findings) {
      console.log(`    - [${finding.severity}] ${finding.id}: ${finding.description}`);
      if (finding.lineHint !== undefined) {
        console.log(`      Line: ${finding.lineHint}`);
      }
      console.log(`      Recommendation: ${finding.recommendation}`);
    }

    console.log('');
  }
}

export async function writeJson(report: ScanReport, outPath: string): Promise<void> {
  const json = JSON.stringify(report, null, 2);
  await fs.writeFile(outPath, json, 'utf-8');
}

export async function writeMarkdown(report: ScanReport, outPath: string): Promise<void> {
  const lines: string[] = [];

  lines.push('# Config Scan Report');
  lines.push('');
  lines.push(`Scanned At: ${report.scannedAt}`);
  lines.push('');

  for (const file of report.files) {
    lines.push(`## File: ${file.path}`);
    lines.push(`Type: ${file.configType}  `);
    lines.push(`Overall Risk: ${file.overallRisk} (score: ${file.overallScore})`);
    lines.push('');

    if (file.findings.length === 0) {
      lines.push('_No findings._');
      lines.push('');
      continue;
    }

    lines.push('### Findings');
    lines.push('');

    for (const finding of file.findings) {
      const lineInfo =
        finding.lineHint !== undefined ? ` (Line ~${finding.lineHint})` : '';
      lines.push(`- **[${finding.severity}] ${finding.id}${lineInfo}**  `);
      lines.push(`  Description: ${finding.description}  `);
      lines.push(`  Recommendation: ${finding.recommendation}`);
      lines.push('');
    }
  }

  const content = lines.join('\n');
  await fs.writeFile(outPath, content, 'utf-8');
}
