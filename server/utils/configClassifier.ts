import path from 'path';
import type { ConfigType } from '../models/rule';

export interface ClassifiedConfigFile {
  path: string;
  configType: ConfigType;
}

export function classifyFile(filePath: string, content: string): ConfigType | null {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);

  // Docker: filename is exactly "Dockerfile" (case-insensitive)
  if (basename.toLowerCase() === 'dockerfile') {
    return 'docker';
  }

  // Kubernetes: .yaml/.yml extension + contains "apiVersion:" and "kind:"
  if ((ext === '.yaml' || ext === '.yml') && 
      content.includes('apiVersion:') && 
      content.includes('kind:')) {
    return 'kubernetes';
  }

  // Nginx: filename is nginx.conf OR .conf extension + contains "server {"
  if (basename === 'nginx.conf' || 
      (ext === '.conf' && content.includes('server {'))) {
    return 'nginx';
  }

  // Not a config file we care about
  return null;
}
