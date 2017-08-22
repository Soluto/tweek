import TagsRepository from '../repositories/tags-repository';
import KeysRepository from '../repositories/keys-repository';
import AppsRepository from '../repositories/apps-repository';
// import { Inject } from 'typescript-ioc';

export type RoutesConfig = {
  tagsRepository: TagsRepository,
  keysRepository: KeysRepository,
  appsRepository: AppsRepository,
};
