import fs from 'fs/promises';
import { findAllFiles } from '../utils/fsWalk';
import { classifyFile } from '../utils/configClassifier';
import type { ScanReport, FileReport } from '../models/report';
import type { ConfigType, RuleContext, RuleFinding, Severity } from '../models/rule';
import { getRulesForConfigType } from './rules';

function severityToScore(severity: Severity): number {
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

function computeOverallRisk(findings: RuleFinding[]): Severity {
  if (findings.length === 0) return 'LOW';

  const severitiesOrder: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let maxIndex = 0;

  for (const f of findings) {
    const idx = severitiesOrder.indexOf(f.severity);
    if (idx > maxIndex) maxIndex = idx;
  }

  return severitiesOrder[maxIndex];
}

function computeOverallScore(findings: RuleFinding[]): number {
  return findings.reduce((sum, f) => sum + severityToScore(f.severity), 0);
}

export async function scanPath(root: string): Promise<ScanReport> {
  const allFiles = await findAllFiles(root);
  const fileReports: FileReport[] = [];

  for (const filePath of allFiles) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const configType = classifyFile(filePath, raw);

      if (!configType) {
        continue;
      }

      const lines = raw.split(/\r?\n/);

      const ctx: RuleContext = {
        raw,
        lines,
        path: filePath,
        configType
      };

      const rules = getRulesForConfigType(configType);
      const findings: RuleFinding[] = rules.flatMap(rule => rule(ctx));

      const overallScore = computeOverallScore(findings);
      const overallRisk = computeOverallRisk(findings);

      const report: FileReport = {
        path: filePath,
        configType,
        findings,
        overallScore,
        overallRisk,
      };

      fileReports.push(report);
    } catch (error) {
      // Skip files we can't read
      console.warn(`Warning: Could not read file ${filePath}`);
    }
  }

  return {
    files: fileReports,
    scannedAt: new Date().toISOString(),
  };
}
