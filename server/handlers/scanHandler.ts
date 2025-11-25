import fs from 'fs/promises';
import { findAllFiles } from '../utils/fsWalk';
import { classifyFile } from '../utils/configClassifier';
import type { ScanReport, FileReport } from '../models/report';
import type { Severity } from '../models/rule';

const DEFAULT_RISK: Severity = 'LOW';

export async function scanPath(root: string): Promise<ScanReport> {
  const allFiles = await findAllFiles(root);
  const fileReports: FileReport[] = [];

  for (const filePath of allFiles) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const configType = classifyFile(filePath, raw);

      if (!configType) {
        continue; // skip non-config files
      }

      const report: FileReport = {
        path: filePath,
        configType,
        findings: [],         // no rules yet in Phase 2
        overallScore: 0,      // placeholder
        overallRisk: DEFAULT_RISK
      };

      fileReports.push(report);
    } catch (error) {
      // Skip files we can't read
      console.warn(`Warning: Could not read file ${filePath}`);
    }
  }

  return {
    files: fileReports,
    scannedAt: new Date().toISOString()
  };
}
