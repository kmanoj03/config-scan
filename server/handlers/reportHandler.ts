import { ScanReport } from '../models/report';

export type ReportFormat = 'console' | 'json' | 'markdown';

export function printReport(report: ScanReport, format: ReportFormat): void {
  switch (format) {
    case 'console':
      printConsoleReport(report);
      break;
    case 'json':
      console.log(JSON.stringify(report, null, 2));
      break;
    case 'markdown':
      printMarkdownReport(report);
      break;
    default:
      console.error(`Unknown format: ${format}`);
  }
}

function printConsoleReport(report: ScanReport): void {
  console.log('\n=== Config Scan Report ===');
  console.log(`Files Scanned: ${report.files.length}`);
  console.log(`Scanned at: ${report.scannedAt}`);
  
  if (report.files.length > 0) {
    console.log('\nConfig files:');
    for (const file of report.files) {
      console.log(`- [${file.configType}] ${file.path}`);
    }
  }
  console.log('==========================\n');
}

function printMarkdownReport(report: ScanReport): void {
  console.log('# Config Scan Report\n');
  console.log(`**Files Scanned:** ${report.files.length}\n`);
  console.log(`**Scanned at:** ${report.scannedAt}\n`);
  
  if (report.files.length > 0) {
    console.log('## Config Files\n');
    for (const file of report.files) {
      console.log(`- **[${file.configType}]** ${file.path}`);
    }
  }
}
