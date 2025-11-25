import { Command } from 'commander';
import { scanPath } from '../handlers/scanHandler';

export function runCli(): void {
  const program = new Command();

  program
    .name('config-scan')
    .description('Scan a directory for config files (docker, kubernetes, nginx) and run security rules.')
    .argument('[path]', 'Root path to scan', '.')
    .action(async (pathArg: string) => {
      try {
        const report = await scanPath(pathArg);

        const files = report.files;
        const totalConfigs = files.length;
        const totalFindings = files.reduce((sum, f) => sum + f.findings.length, 0);

        console.log(`Scanned path: ${pathArg}`);
        console.log(`Detected ${totalConfigs} config file(s).`);
        console.log(`Total findings: ${totalFindings}`);
        console.log(`Scanned at: ${report.scannedAt}`);
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
      } catch (err) {
        console.error('Error during scan:', err);
        process.exitCode = 1;
      }
    });

  program.parse(process.argv);
}
