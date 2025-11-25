export type ConfigType = 'docker' | 'kubernetes' | 'nginx' | 'unknown';

export function classifyConfig(path: string, content: string): ConfigType {
  // Normalize path and content for case-insensitive comparisons
  const lowerPath = path.toLowerCase();
  const lowerContent = content.toLowerCase();

  // Check for Dockerfile
  if (lowerPath.includes('dockerfile')) {
    return 'docker';
  }

  // Check for Kubernetes
  if (
    lowerPath.includes('k8s') ||
    (content.includes('apiVersion:') && content.includes('kind:'))
  ) {
    return 'kubernetes';
  }

  // Check for Nginx
  if (path.endsWith('.conf') && lowerContent.includes('server {')) {
    return 'nginx';
  }

  return 'unknown';
}

