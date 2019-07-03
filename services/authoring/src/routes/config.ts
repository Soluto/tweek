import TagsRepository from '../repositories/tags-repository';
import KeysRepository from '../repositories/keys-repository';
import AppsRepository from '../repositories/apps-repository';
import PolicyRepository from '../repositories/policy-repository';
import SubjectExtractionRulesRepository from '../repositories/extraction-rules-repository';
import HooksRepository from '../repositories/hooks-repository';

export type RoutesConfig = {
  tagsRepository: TagsRepository;
  keysRepository: KeysRepository;
  appsRepository: AppsRepository;
  policyRepository: PolicyRepository;
  subjectExtractionRulesRepository: SubjectExtractionRulesRepository;
  hooksRepository: HooksRepository;
};
