import type { Rule, RuleFinding } from '../../models/rule';

// Rule: Check for usage of 'latest' tag in FROM instructions
const checkLatestTag: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('from ') && line.includes(':latest')) {
      findings.push({
        id: 'DOCKER_LATEST_TAG',
        configType: 'docker',
        severity: 'HIGH',
        description: "Docker image uses the 'latest' tag.",
        recommendation: "Pin a specific version tag instead of 'latest' to ensure reproducible builds.",
        lineHint: i + 1, // 1-based line number
      });
    }
  }

  return findings;
};

// Rule: Check for missing USER instruction (running as root)
const checkMissingUser: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasUserInstruction = ctx.lines.some((line) => {
    const lowerLine = line.trim().toLowerCase();
    return lowerLine.startsWith('user ');
  });

  if (!hasUserInstruction) {
    findings.push({
      id: 'DOCKER_MISSING_USER',
      configType: 'docker',
      severity: 'MEDIUM',
      description: 'Dockerfile does not specify a USER and will run as root by default.',
      recommendation: 'Add a non-root USER to reduce the impact of a container compromise.',
    });
  }

  return findings;
};

export const dockerRules: Rule[] = [
  checkLatestTag,
  checkMissingUser,
];

