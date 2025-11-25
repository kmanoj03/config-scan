export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfigType = 'docker' | 'kubernetes' | 'nginx';

export interface RuleContext {
  raw: string;            // entire file content
  lines: string[];        // file content split by line
  path: string;           // file path
  configType: ConfigType;
}

export interface RuleFinding {
  id: string;             // rule ID, e.g. 'DOCKER_001'
  configType: ConfigType;
  severity: Severity;
  description: string;
  recommendation: string;
  lineHint?: number;
}

export type Rule = (ctx: RuleContext) => RuleFinding[];
