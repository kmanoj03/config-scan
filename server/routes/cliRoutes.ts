import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { scanPath } from '../handlers/scanHandler';
import { printConsole, writeJson, writeMarkdown } from '../handlers/reportHandler';

type OutputFormat = 'console' | 'json' | 'md' | 'all';

interface CliOptions {
  format?: OutputFormat;
  out?: string;
}

export function runCli(): void {
  const program = new Command();

  program
    .name('config-scan')
    .description('Scan a directory for config files (docker, kubernetes, nginx) and run security rules.')
    .argument('[path]', 'Root path to scan', '.')
    .option(
      '--format <format>',
      'Output format: console | json | md | all',
      'console'
    )
    .option(
      '--out <dir>',
      'Output directory for JSON/Markdown reports (when format is json/md/all)',
      './reports'
    )
    .action(async (pathArg: string, options: CliOptions) => {
      const format = (options.format ?? 'console') as OutputFormat;
      const outDir = options.out ?? './reports';

      try {
        const report = await scanPath(pathArg);

        // Always show console when format includes console or all
        if (format === 'console' || format === 'all') {
          printConsole(report);
        }

        // If JSON or ALL selected, ensure directory and write JSON
        if (format === 'json' || format === 'all') {
          await fs.mkdir(outDir, { recursive: true });

          const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-');
          const jsonPath = path.join(outDir, `report-${timestamp}.json`);

          await writeJson(report, jsonPath);
          console.log(`JSON report written to: ${jsonPath}`);
        }

        // If MD or ALL selected, ensure directory and write Markdown
        if (format === 'md' || format === 'all') {
          await fs.mkdir(outDir, { recursive: true });

          const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-');
          const mdPath = path.join(outDir, `report-${timestamp}.md`);

          await writeMarkdown(report, mdPath);
          console.log(`Markdown report written to: ${mdPath}`);
        }
      } catch (err) {
        console.error('Error during scan:', err);
        process.exitCode = 1;
      }
    });

  program.parse(process.argv);
}
