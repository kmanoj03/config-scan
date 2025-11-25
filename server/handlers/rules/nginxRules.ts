import type { Rule, RuleFinding } from '../../models/rule';

// Rule: Check for server_tokens on
const checkServerTokens: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const lowerContent = ctx.raw.toLowerCase();
  if (lowerContent.includes('server_tokens on')) {
    findings.push({
      id: 'NGINX_SERVER_TOKENS_ON',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: "Nginx is configured with 'server_tokens on', exposing version info.",
      recommendation: "Set 'server_tokens off;' to avoid leaking Nginx version information in responses.",
    });
  }

  return findings;
};

// Rule: Check for missing ssl_protocols when using TLS
const checkMissingSslProtocols: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasTlsConfig = ctx.raw.includes('ssl_certificate') || ctx.raw.includes('listen 443');
  const hasSslProtocols = ctx.raw.includes('ssl_protocols');

  if (hasTlsConfig && !hasSslProtocols) {
    findings.push({
      id: 'NGINX_MISSING_SSL_PROTOCOLS',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: "TLS is configured without explicitly setting 'ssl_protocols'.",
      recommendation: "Set 'ssl_protocols TLSv1.2 TLSv1.3;' (or your org's policy) to avoid weak protocols.",
    });
  }

  return findings;
};

export const nginxRules: Rule[] = [
  checkServerTokens,
  checkMissingSslProtocols,
];

