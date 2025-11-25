import type { Rule, RuleFinding } from '../../models/rule';

// Rule: Check for privileged containers
const checkPrivilegedContainer: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (ctx.raw.includes('privileged: true')) {
    findings.push({
      id: 'K8S_PRIVILEGED_CONTAINER',
      configType: 'kubernetes',
      severity: 'HIGH',
      description: 'One or more containers are running in privileged mode.',
      recommendation: 'Avoid privileged containers; use fine-grained capabilities instead.',
    });
  }

  return findings;
};

// Rule: Check for missing resources block
const checkMissingResources: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (!ctx.raw.includes('resources:')) {
    findings.push({
      id: 'K8S_MISSING_RESOURCES',
      configType: 'kubernetes',
      severity: 'MEDIUM',
      description: 'No resource requests/limits configured for Pods/containers.',
      recommendation: 'Set CPU and memory requests/limits to ensure fair scheduling and prevent noisy-neighbor issues.',
    });
  }

  return findings;
};

export const kubernetesRules: Rule[] = [
  checkPrivilegedContainer,
  checkMissingResources,
];

