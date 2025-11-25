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
        lineHint: i + 1,
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

// Rule: Check for missing HEALTHCHECK
const checkMissingHealthcheck: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasHealthcheck = ctx.lines.some((line) => {
    const lowerLine = line.trim().toLowerCase();
    return lowerLine.startsWith('healthcheck ');
  });

  if (!hasHealthcheck) {
    findings.push({
      id: 'DOCKER_MISSING_HEALTHCHECK',
      configType: 'docker',
      severity: 'MEDIUM',
      description: 'Dockerfile does not include a HEALTHCHECK instruction.',
      recommendation: 'Add a HEALTHCHECK to enable container health monitoring and automatic recovery.',
    });
  }

  return findings;
};

// Rule: Check for exposing SSH (port 22)
const checkExposeSSH: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('expose ') && /expose\s+22\b/i.test(line)) {
      findings.push({
        id: 'DOCKER_EXPOSE_SSH',
        configType: 'docker',
        severity: 'HIGH',
        description: 'Dockerfile exposes SSH port 22.',
        recommendation: 'Avoid running SSH in containers. Use docker exec for debugging or proper orchestration tools.',
        lineHint: i + 1,
      });
    }
  }

  return findings;
};

// Rule: Check for dangerous COPY . . pattern
const checkCopyDotDot: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('copy ') && /copy\s+\.\s+\./i.test(line)) {
      findings.push({
        id: 'DOCKER_COPY_DOT_DOT',
        configType: 'docker',
        severity: 'MEDIUM',
        description: 'Dockerfile uses COPY . . which may include sensitive files.',
        recommendation: 'Use specific COPY paths or a .dockerignore file to avoid copying secrets, .git, or build artifacts.',
        lineHint: i + 1,
      });
    }
  }

  return findings;
};

// Rule: Check for missing CMD or ENTRYPOINT
const checkNoCmdOrEntrypoint: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasCmd = ctx.lines.some((line) => line.trim().toLowerCase().startsWith('cmd '));
  const hasEntrypoint = ctx.lines.some((line) => line.trim().toLowerCase().startsWith('entrypoint '));

  if (!hasCmd && !hasEntrypoint) {
    findings.push({
      id: 'DOCKER_NO_CMD_OR_ENTRYPOINT',
      configType: 'docker',
      severity: 'LOW',
      description: 'Dockerfile does not specify CMD or ENTRYPOINT.',
      recommendation: 'Add CMD or ENTRYPOINT to define the container default behavior.',
    });
  }

  return findings;
};

// Rule: Check for known bad/outdated base images
const checkBadBaseImage: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const badBasePatterns = [
    'ubuntu:14.',
    'ubuntu:16.',
    'centos:6',
    'centos:7',
    'alpine:3.4',
    'alpine:3.5',
    'debian:7',
    'debian:8',
  ];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('from ')) {
      for (const pattern of badBasePatterns) {
        if (lowerLine.includes(pattern)) {
          findings.push({
            id: 'DOCKER_BAD_BASE_IMAGE',
            configType: 'docker',
            severity: 'HIGH',
            description: `Dockerfile uses an outdated or unsupported base image containing '${pattern}'.`,
            recommendation: 'Update to a supported base image version to receive security patches.',
            lineHint: i + 1,
          });
          break;
        }
      }
    }
  }

  return findings;
};

// Rule: Check for package install without cleanup
const checkPackageInstallNoCleanup: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();
    const lowerLine = line.toLowerCase();

    const hasAptInstall = lowerLine.includes('apt-get install') || lowerLine.includes('apt install');
    const hasYumInstall = lowerLine.includes('yum install');
    const hasApkAdd = lowerLine.includes('apk add');

    const hasCleanup = 
      lowerLine.includes('rm -rf /var/lib/apt/lists') ||
      lowerLine.includes('--no-cache') ||
      lowerLine.includes('yum clean all');

    if ((hasAptInstall || hasYumInstall || hasApkAdd) && !hasCleanup) {
      findings.push({
        id: 'DOCKER_PACKAGE_INSTALL_NO_CLEANUP',
        configType: 'docker',
        severity: 'LOW',
        description: 'Package installation without cleanup increases image size.',
        recommendation: 'Add cleanup commands (e.g., rm -rf /var/lib/apt/lists/* for apt, yum clean all, or use apk add --no-cache).',
        lineHint: i + 1,
      });
    }
  }

  return findings;
};

export const dockerRules: Rule[] = [
  checkLatestTag,
  checkMissingUser,
  checkMissingHealthcheck,
  checkExposeSSH,
  checkCopyDotDot,
  checkNoCmdOrEntrypoint,
  checkBadBaseImage,
  checkPackageInstallNoCleanup,
];
