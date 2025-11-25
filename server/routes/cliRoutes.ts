import { Command } from 'commander';
import { scanPath } from '../handlers/scanHandler';

export function runCli(): void {
  const program = new Command();

  program
    .name('config-scan')
    .description('Scan a directory for config files and classify them (docker, kubernetes, nginx).')
    .argument('[path]', 'Root path to scan', '.')
    .action(async (pathArg: string) => {
      try {
        const report = await scanPath(pathArg);
        const count = report.files.length;

        console.log(`Scanned path: ${pathArg}`);
        console.log(`Detected ${count} config file(s).`);

        if (count > 0) {
          console.log('Config files:');
          for (const file of report.files) {
            console.log(`- [${file.configType}] ${file.path}`);
          }
        }

        console.log(`Scanned at: ${report.scannedAt}`);
      } catch (err) {
        console.error('Error during scan:', err);
        process.exitCode = 1;
      }
    });

  program.parse(process.argv);
}
