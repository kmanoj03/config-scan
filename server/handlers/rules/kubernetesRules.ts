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

// Rule: Check for running as root (runAsUser: 0)
const checkRunAsRoot: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (ctx.raw.includes('runAsUser: 0') || ctx.raw.includes('runAsNonRoot: false')) {
    findings.push({
      id: 'K8S_RUN_AS_ROOT',
      configType: 'kubernetes',
      severity: 'HIGH',
      description: 'Container is configured to run as root user.',
      recommendation: 'Set runAsNonRoot: true and specify a non-zero runAsUser to improve security.',
    });
  }

  return findings;
};

// Rule: Check for missing securityContext
const checkMissingSecurityContext: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (!ctx.raw.includes('securityContext:')) {
    findings.push({
      id: 'K8S_MISSING_SECURITY_CONTEXT',
      configType: 'kubernetes',
      severity: 'MEDIUM',
      description: 'No securityContext defined for Pod or containers.',
      recommendation: 'Add securityContext to enforce security policies like runAsNonRoot, capabilities, etc.',
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

// Rule: Check for missing liveness/readiness probes
const checkMissingProbes: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasLivenessProbe = ctx.raw.includes('livenessProbe:');
  const hasReadinessProbe = ctx.raw.includes('readinessProbe:');

  if (!hasLivenessProbe && !hasReadinessProbe) {
    findings.push({
      id: 'K8S_MISSING_PROBES',
      configType: 'kubernetes',
      severity: 'MEDIUM',
      description: 'No liveness or readiness probes configured.',
      recommendation: 'Add probes to enable automatic health checks and recovery.',
    });
  }

  return findings;
};

// Rule: Check for hostPath volumes
const checkHostPathVolume: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (ctx.raw.includes('hostPath:')) {
    findings.push({
      id: 'K8S_HOSTPATH_VOLUME',
      configType: 'kubernetes',
      severity: 'HIGH',
      description: 'hostPath volume detected, which exposes host filesystem to the pod.',
      recommendation: 'Avoid hostPath volumes; use persistent volumes, configMaps, or secrets instead.',
    });
  }

  return findings;
};

// Rule: Check for hostNetwork: true
const checkHostNetworkTrue: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (ctx.raw.includes('hostNetwork: true')) {
    findings.push({
      id: 'K8S_HOSTNETWORK_TRUE',
      configType: 'kubernetes',
      severity: 'HIGH',
      description: 'Pod is configured with hostNetwork: true, sharing the host network namespace.',
      recommendation: 'Avoid hostNetwork unless absolutely necessary; it reduces isolation.',
    });
  }

  return findings;
};

// Rule: Check for image using :latest tag
const checkImageLatestTag: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim();

    if (line.includes('image:') && line.includes(':latest')) {
      findings.push({
        id: 'K8S_IMAGE_LATEST_TAG',
        configType: 'kubernetes',
        severity: 'MEDIUM',
        description: "Container image uses the 'latest' tag.",
        recommendation: "Pin specific image versions instead of 'latest' to ensure consistency.",
        lineHint: i + 1,
      });
    }
  }

  return findings;
};

// Rule: Check for missing readOnlyRootFilesystem
const checkMissingReadOnlyRootFs: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasSecurityContext = ctx.raw.includes('securityContext:');
  const hasReadOnlyRootFs = ctx.raw.includes('readOnlyRootFilesystem: true');

  if (hasSecurityContext && !hasReadOnlyRootFs) {
    findings.push({
      id: 'K8S_MISSING_READONLY_ROOT_FS',
      configType: 'kubernetes',
      severity: 'MEDIUM',
      description: 'securityContext is present but readOnlyRootFilesystem is not set to true.',
      recommendation: 'Set readOnlyRootFilesystem: true to make the container filesystem immutable.',
    });
  }

  return findings;
};

export const kubernetesRules: Rule[] = [
  checkPrivilegedContainer,
  checkRunAsRoot,
  checkMissingSecurityContext,
  checkMissingResources,
  checkMissingProbes,
  checkHostPathVolume,
  checkHostNetworkTrue,
  checkImageLatestTag,
  checkMissingReadOnlyRootFs,
];
