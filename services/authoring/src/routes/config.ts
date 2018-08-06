import TagsRepository from '../repositories/tags-repository';
import KeysRepository from '../repositories/keys-repository';
import AppsRepository from '../repositories/apps-repository';
import PolicyRepository from '../repositories/policy-repository';
import ExtractionRulesRepository from '../repositories/extraction-rules-repository';

export type RoutesConfig = {
  tagsRepository: TagsRepository,
  keysRepository: KeysRepository,
  appsRepository: AppsRepository,
  policyRepository: PolicyRepository,
  extractionRulesRepository: ExtractionRulesRepository,
};
