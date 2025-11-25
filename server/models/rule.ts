export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RuleContext {
  raw: string;            // entire file content
  lines: string[];        // file content split by line
  path: string;           // file path
  configType: string;     // e.g. 'docker', 'kubernetes', 'nginx', 'unknown'
}

export interface RuleFinding {
  id: string;             // rule ID, e.g. 'DOCKER_001'
  configType: string;
  severity: Severity;
  description: string;
  recommendation: string;
  line?: number;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  appliesTo(configType: string): boolean;
  run(context: RuleContext): RuleFinding[];
}

