import { Command } from 'commander';
import * as path from 'path';
import { scanPath } from '../handlers/scanHandler';
import { buildOverallReport, printReport, ReportFormat } from '../handlers/reportHandler';

export function runCli(): void {
  const program = new Command();

  program
    .name('config-scan')
    .description('Scan configuration directories (Docker/Kubernetes/Nginx) for security findings (Phase 1 skeleton: no actual rules yet).')
    .version('1.0.0')
    .argument('[path]', 'Path to scan (defaults to current directory)', '.')
    .option('--format <format>', 'Output format: console, json, or markdown', 'console')
    .action(async (targetPath: string, options: { format: string }) => {
      try {
        // Resolve the path
        const resolvedPath = path.resolve(targetPath);

        // Validate format
        const validFormats: ReportFormat[] = ['console', 'json', 'markdown'];
        const format = options.format as ReportFormat;
        
        if (!validFormats.includes(format)) {
          console.error(`Invalid format: ${format}. Must be one of: console, json, markdown`);
          process.exit(1);
        }

        // Scan the path
        const fileReports = await scanPath({ rootPath: resolvedPath });

        // Build the overall report
        const report = buildOverallReport(resolvedPath, fileReports);

        // Print the report
        printReport(report, format);
      } catch (error) {
        console.error('Error during scan:', error);
        process.exit(1);
      }
    });

  program.parse();
}

