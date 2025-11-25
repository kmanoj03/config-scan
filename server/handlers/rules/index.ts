import type { ConfigType, Rule } from '../../models/rule';
import { dockerRules } from './dockerRules';
import { kubernetesRules } from './kubernetesRules';
import { nginxRules } from './nginxRules';

const rulesByType: Record<ConfigType, Rule[]> = {
  docker: dockerRules,
  kubernetes: kubernetesRules,
  nginx: nginxRules,
};

export function getRulesForConfigType(type: ConfigType): Rule[] {
  return rulesByType[type] ?? [];
}

