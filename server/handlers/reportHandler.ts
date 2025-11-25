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
      // Build standards reference inline
      const standards: string[] = [];
      if (finding.cis) standards.push(finding.cis);
      if (finding.cweId) standards.push(finding.cweId);
      if (finding.owasp) standards.push(finding.owasp);
      if (finding.nsa) standards.push(finding.nsa);
      const standardsStr = standards.length > 0 ? ` [${standards.join(' | ')}]` : '';
      
      console.log(`    - [${finding.severity}] ${finding.id}${standardsStr}: ${finding.description}`);
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
      
      // Add standards mapping if present
      const hasStandards = finding.cis || finding.cweId || finding.owasp || finding.nsa;
      if (hasStandards) {
        lines.push(`  **Related Standards:**`);
        if (finding.cis) lines.push(`  - CIS: ${finding.cis}`);
        if (finding.cweId) lines.push(`  - CWE: ${finding.cweId}`);
        if (finding.owasp) lines.push(`  - OWASP: ${finding.owasp}`);
        if (finding.nsa) lines.push(`  - NSA: ${finding.nsa}`);
      }
      
      lines.push('');
    }
  }

  const content = lines.join('\n');
  await fs.writeFile(outPath, content, 'utf-8');
}
