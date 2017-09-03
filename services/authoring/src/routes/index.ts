import express = require('express');
import { Server } from 'typescript-rest';
import { KeysController } from './keys';
import { BulkKeysUpload } from './bulk-keys-upload';
import { SchemaController } from './schema';
import { TagsController } from './tags';
import { SearchController } from './search';
import { AppsController } from './apps';
import { RoutesConfig } from './config';
import { Container } from 'typescript-ioc';
import AppsRepository from '../repositories/apps-repository';
import KeysRepository from '../repositories/keys-repository';
import TagsRepository from '../repositories/tags-repository';

Server.useIoC();

export default function configureRoutes(config: RoutesConfig): any {
  const app = express();

  Container.bind(AppsRepository).provider({ get: () => config.appsRepository });
  Container.bind(KeysRepository).provider({ get: () => config.keysRepository });
  Container.bind(TagsRepository).provider({ get: () => config.tagsRepository });

  const prefixes = [
    { from: 'keys', to: 'key' },
    { from: 'manifests', to: 'manifest' },
    { from: 'revision-history', to: 'revision-history' },
    { from: 'dependents', to: 'dependent' },
  ];

  prefixes.forEach(prefix => {
    app.all(`/${prefix.from}/*`, (req, res, next) => {
      req.query['keyPath'] = req.params[0];
      req.url = `/${prefix.to}`;
      next();
    });
  });

  Server.setFileDest('uploads/');
  Server.buildServices(app, AppsController, TagsController, SearchController, BulkKeysUpload, SchemaController, KeysController);

  return app;
}
