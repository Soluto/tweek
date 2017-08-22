import express = require('express');
import { compose } from 'ramda';
import multer = require('multer');
import requestErrorHandlingWrapper from '../utils/request-error-handling-wrapper';
import includeAuthor from '../utils/include-author';
import KeysRoutes from './keys';
import BulkKeysRoutes from './bulk-keys-upload';
import SchemaRoutes from './schema';
import /*TagsRoutes,*/ { TagsController } from './tags';
import SearchRoutes from './search';
import { AppsController } from './apps';
import authorize from '../security/authorize';
import PERMISSIONS from '../security/permissions/consts';
import { RoutesConfig } from './config';
import { Server } from 'typescript-rest';
import { Container } from 'typescript-ioc';
import AppsRepository from '../repositories/apps-repository';
import KeysRepository from '../repositories/keys-repository';
import TagsRepository from '../repositories/tags-repository';

const upload = multer({ dest: 'uploads/' });

Server.useIoC();

export default function configureRoutes(config: RoutesConfig): any {
  const app = express();

  Container.bind(AppsRepository).provider({ get: () => config.appsRepository });
  Container.bind(KeysRepository).provider({ get: () => config.keysRepository });
  Container.bind(TagsRepository).provider({ get: () => config.tagsRepository });

  const addConfig = compose(
    requestErrorHandlingWrapper,
    fn => (req, res) => fn(req, res, config),
    includeAuthor,
  );

  app.get(
    '/keys',
    authorize({ permission: PERMISSIONS.KEYS_LIST }),
    addConfig(KeysRoutes.getAllKeys),
  );
  app
    .route('/keys/*')
    .get(authorize({ permission: PERMISSIONS.KEYS_READ }), addConfig(KeysRoutes.getKey))
    .put(authorize({ permission: PERMISSIONS.KEYS_WRITE }), addConfig(KeysRoutes.updateKey))
    .delete(authorize({ permission: PERMISSIONS.KEYS_WRITE }), addConfig(KeysRoutes.deleteKey));

  app.put(
    '/bulk-keys-upload',
    authorize({ permission: PERMISSIONS.KEYS_WRITE }),
    upload.any(),
    addConfig(BulkKeysRoutes.bulkKeysUpload),
  );

  app.get(
    '/revision',
    authorize({ permission: PERMISSIONS.KEYS_READ }),
    addConfig(KeysRoutes.getRevision),
  );
  app.get(
    '/revision-history/*',
    authorize({ permission: PERMISSIONS.HISTORY }),
    addConfig(KeysRoutes.getKeyRevisionHistory),
  );

  app.get(
    '/manifests',
    authorize({ permission: PERMISSIONS.KEYS_LIST }),
    addConfig(KeysRoutes.getAllManifests),
  );
  app.get(
    '/manifests/*',
    authorize({ permission: PERMISSIONS.KEYS_READ }),
    addConfig(KeysRoutes.getManifest),
  );
  app.get(
    '/dependents/*',
    authorize({ permission: PERMISSIONS.KEYS_READ }),
    addConfig(KeysRoutes.getDependents),
  );

  app.get(
    '/schemas',
    authorize({ permission: PERMISSIONS.SCHEMAS_READ }),
    addConfig(SchemaRoutes.getSchemas),
  );
  app
    .route('/schemas/:identityType')
    .patch(
    authorize({ permission: PERMISSIONS.SCHEMAS_WRITE }),
    addConfig(SchemaRoutes.patchIdentity),
  )
    .post(authorize({ permission: PERMISSIONS.SCHEMAS_WRITE }), addConfig(SchemaRoutes.addIdentity))
    .delete(
    authorize({ permission: PERMISSIONS.SCHEMAS_WRITE }),
    addConfig(SchemaRoutes.deleteIdentity),
  );

  app.get(
    '/search-index',
    authorize({ permission: PERMISSIONS.SEARCH_INDEX }),
    addConfig(SearchRoutes.getSearchIndex),
  );
  app.get('/search', authorize({ permission: PERMISSIONS.SEARCH }), addConfig(SearchRoutes.search));
  app.get(
    '/suggestions',
    authorize({ permission: PERMISSIONS.SEARCH }),
    addConfig(SearchRoutes.getSuggestions),
  );

  Server.buildServices(app, AppsController, TagsController);

  return app;
}
