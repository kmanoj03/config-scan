import fs from 'fs/promises';
import { findAllFiles } from '../utils/fsWalk';
import { classifyFile } from '../utils/configClassifier';
import type { ScanReport, FileReport } from '../models/report';
import type { RuleContext, RuleFinding } from '../models/rule';
import { getRulesForConfigType } from './rules';
import { scoreFindings } from '../utils/scoring';

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
        configType,
      };

      const rules = getRulesForConfigType(configType);
      const findings: RuleFinding[] = rules.flatMap(rule => rule(ctx));

      const { overallScore, overallRisk } = scoreFindings(findings);

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
