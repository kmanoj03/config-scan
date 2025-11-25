import { promises as fs } from 'fs';
import { FileReport } from '../models/report';
import { RuleFinding } from '../models/rule';
import { walkConfigFiles } from '../utils/fsWalk';
import { classifyConfig } from '../utils/configClassifier';
import { computeFileRisk } from '../utils/scoring';

export interface ScanOptions {
  rootPath: string;
}

export async function scanPath(options: ScanOptions): Promise<FileReport[]> {
  const filePaths = await walkConfigFiles(options.rootPath);
  const fileReports: FileReport[] = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const configType = classifyConfig(filePath, content);

      // Phase 1: No rules yet, just structure
      const findings: RuleFinding[] = [];
      const riskScore = computeFileRisk(findings);

      fileReports.push({
        path: filePath,
        configType,
        findings,
        riskScore,
      });
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error);
    }
  }

  return fileReports;
}

