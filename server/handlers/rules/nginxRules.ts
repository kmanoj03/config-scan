import type { Rule, RuleFinding } from '../../models/rule';

// Rule: Check for weak or missing ssl_protocols
const checkSslProtocolsWeakOrMissing: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasTls = 
    ctx.raw.includes('ssl_certificate') || 
    ctx.raw.includes('listen 443') ||
    ctx.raw.includes('listen 443 ssl');

  if (!hasTls) {
    return findings; // No TLS, skip this rule
  }

  // Check if ssl_protocols is present
  const sslProtocolsLine = ctx.lines.find(line => 
    line.toLowerCase().includes('ssl_protocols')
  );

  if (!sslProtocolsLine) {
    findings.push({
      id: 'NGINX_SSL_PROTOCOLS_WEAK_OR_MISSING',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: "TLS is configured without explicitly setting 'ssl_protocols'.",
      recommendation: "Set 'ssl_protocols TLSv1.2 TLSv1.3;' to avoid weak protocols.",
      cis: 'CIS 2.1.1',
      cweId: 'CWE-326',
      owasp: 'ASVS 14.4',
    });
  } else {
    // Check for weak protocols
    const weakProtocols = ['sslv3', 'tlsv1.0', 'tlsv1.1', 'tlsv1 '];
    const lowerLine = sslProtocolsLine.toLowerCase();

    for (const weak of weakProtocols) {
      if (lowerLine.includes(weak)) {
        findings.push({
          id: 'NGINX_SSL_PROTOCOLS_WEAK_OR_MISSING',
          configType: 'nginx',
          severity: 'CRITICAL',
          description: `Weak SSL/TLS protocol detected: ${weak}.`,
          recommendation: "Use only 'ssl_protocols TLSv1.2 TLSv1.3;' to ensure strong encryption.",
          cis: 'CIS 2.1.1',
          cweId: 'CWE-326',
          owasp: 'ASVS 14.4',
        });
        break;
      }
    }
  }

  return findings;
};

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
      cis: 'CIS 2.2',
      cweId: 'CWE-200',
    });
  }

  return findings;
};

// Rule: Check for missing X-Content-Type-Options
const checkMissingXContentTypeOptions: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (!ctx.raw.toLowerCase().includes('x-content-type-options')) {
    findings.push({
      id: 'NGINX_MISSING_X_CONTENT_TYPE_OPTIONS',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: 'Missing X-Content-Type-Options security header.',
      recommendation: "Add 'add_header X-Content-Type-Options \"nosniff\" always;' to prevent MIME-type sniffing.",
      cweId: 'CWE-16',
      owasp: 'ASVS 14.4.3',
    });
  }

  return findings;
};

// Rule: Check for missing X-Frame-Options
const checkMissingXFrameOptions: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (!ctx.raw.toLowerCase().includes('x-frame-options')) {
    findings.push({
      id: 'NGINX_MISSING_X_FRAME_OPTIONS',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: 'Missing X-Frame-Options security header.',
      recommendation: "Add 'add_header X-Frame-Options \"SAMEORIGIN\" always;' to prevent clickjacking attacks.",
      cweId: 'CWE-1021',
      owasp: 'ASVS 14.4.2',
    });
  }

  return findings;
};

// Rule: Check for autoindex on
const checkAutoindexOn: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  if (ctx.raw.toLowerCase().includes('autoindex on')) {
    findings.push({
      id: 'NGINX_AUTOINDEX_ON',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: "Nginx has 'autoindex on', which enables directory listing.",
      recommendation: "Set 'autoindex off;' to prevent exposing directory contents.",
      cweId: 'CWE-548',
      cis: 'CIS 2.3',
    });
  }

  return findings;
};

// Rule: Check for HTTP without redirect to HTTPS
const checkHttpNoRedirect: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasHttp = ctx.raw.includes('listen 80');
  const hasRedirect = 
    ctx.raw.includes('return 301 https://') ||
    ctx.raw.includes('return 302 https://') ||
    ctx.raw.includes('rewrite ^ https://');

  if (hasHttp && !hasRedirect) {
    findings.push({
      id: 'NGINX_HTTP_NO_REDIRECT',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: 'HTTP (port 80) is configured without redirect to HTTPS.',
      recommendation: "Add a redirect: 'return 301 https://\$host\$request_uri;' to enforce HTTPS.",
      cweId: 'CWE-319',
      owasp: 'ASVS 14.4',
    });
  }

  return findings;
};

// Rule: Check client_max_body_size
const checkClientMaxBodySize: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const clientMaxBodyLine = ctx.lines.find(line => 
    line.toLowerCase().includes('client_max_body_size')
  );

  if (!clientMaxBodyLine) {
    findings.push({
      id: 'NGINX_CLIENT_MAX_BODY_SIZE',
      configType: 'nginx',
      severity: 'LOW',
      description: 'client_max_body_size not explicitly set.',
      recommendation: 'Set an appropriate client_max_body_size to prevent abuse (e.g., 10m).',
      cweId: 'CWE-400',
    });
  } else {
    // Check for very large values
    const match = clientMaxBodyLine.match(/client_max_body_size\s+(\d+)m/i);
    if (match) {
      const size = parseInt(match[1], 10);
      if (size > 50) {
        findings.push({
          id: 'NGINX_CLIENT_MAX_BODY_SIZE',
          configType: 'nginx',
          severity: 'MEDIUM',
          description: `client_max_body_size is set to a very large value (${size}m).`,
          recommendation: 'Consider reducing client_max_body_size to prevent resource exhaustion attacks.',
          cweId: 'CWE-400',
        });
      }
    }
  }

  return findings;
};

// Rule: Check for missing HSTS when TLS is used
const checkMissingHsts: Rule = (ctx) => {
  const findings: RuleFinding[] = [];

  const hasTls = 
    ctx.raw.includes('ssl_certificate') || 
    ctx.raw.includes('listen 443');
  const hasHsts = ctx.raw.includes('Strict-Transport-Security');

  if (hasTls && !hasHsts) {
    findings.push({
      id: 'NGINX_MISSING_HSTS',
      configType: 'nginx',
      severity: 'MEDIUM',
      description: 'HTTPS is configured but Strict-Transport-Security (HSTS) header is missing.',
      recommendation: "Add 'add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;' to enforce HTTPS.",
      cweId: 'CWE-319',
      owasp: 'ASVS 14.4.1',
    });
  }

  return findings;
};

export const nginxRules: Rule[] = [
  checkSslProtocolsWeakOrMissing,
  checkServerTokens,
  checkMissingXContentTypeOptions,
  checkMissingXFrameOptions,
  checkAutoindexOn,
  checkHttpNoRedirect,
  checkClientMaxBodySize,
  checkMissingHsts,
];
