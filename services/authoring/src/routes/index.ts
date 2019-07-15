import express = require('express');
import { Server } from 'typescript-rest';
import { KeysController } from './keys';
import { BulkKeysUpload } from './bulk-keys-upload';
import { SchemaController } from './schema';
import { TagsController } from './tags';
import { SearchController } from './search';
import { AppsController } from './apps';
import { PolicyController } from './policies';
import { HooksController } from './hooks';
import { SubjectExtractionRulesController } from './subject-extraction-rules';
import { RoutesConfig } from './config';
import { Container } from 'typescript-ioc';
import AppsRepository from '../repositories/apps-repository';
import KeysRepository from '../repositories/keys-repository';
import TagsRepository from '../repositories/tags-repository';
import PolicyRepository from '../repositories/policy-repository';
import SubjectExtractionRulesRepository from '../repositories/extraction-rules-repository';
import { HooksRepositoryFactory } from '../repositories/hooks-repository';

Server.useIoC();

export default function configureRoutes(config: RoutesConfig): any {
  const app = express();

  Container.bind(AppsRepository).provider({ get: () => config.appsRepository });
  Container.bind(KeysRepository).provider({ get: () => config.keysRepository });
  Container.bind(TagsRepository).provider({ get: () => config.tagsRepository });
  Container.bind(PolicyRepository).provider({ get: () => config.policyRepository });
  Container.bind(HooksRepositoryFactory).provider({ get: () => config.hooksRepositoryFactory });
  Container.bind(SubjectExtractionRulesRepository).provider({
    get: () => config.subjectExtractionRulesRepository,
  });

  const prefixes = [
    { from: 'keys', to: 'key' },
    { from: 'manifests', to: 'manifest' },
    { from: 'revision-history', to: 'revision-history' },
    { from: 'dependents', to: 'dependent' },
    { from: 'hooks', to: 'hook' },
  ];

  prefixes.forEach((prefix) => {
    app.all(`/${prefix.from}/*`, (req, res, next) => {
      req.query['keyPath'] = req.params[0];
      req.url = `/${prefix.to}`;
      next();
    });
  });

  Server.setFileDest('uploads/');
  Server.buildServices(
    app,
    AppsController,
    TagsController,
    SearchController,
    BulkKeysUpload,
    SchemaController,
    KeysController,
    PolicyController,
    SubjectExtractionRulesController,
    HooksController,
  );

  return app;
}
