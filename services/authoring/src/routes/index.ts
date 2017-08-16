import express = require('express');
import { compose } from 'ramda';
import multer = require('multer');
import requestErrorHandlingWrapper from '../utils/request-error-handling-wrapper';
import includeAuthor from '../utils/include-author';
import KeysRoutes from './keys';
import BulkKeysRoutes from './bulk-keys-upload';
import SchemaRoutes from './schema';
import TagsRoutes from './tags';
import SearchRoutes from './search';
import AppsRoutes from './apps';
import authorize from '../security/authorize';
import PERMISSIONS from '../security/permissions/consts';

const upload = multer({ dest: 'uploads/' });

export default function configureRoutes(config): any {
  const app = express();

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

  app
    .route('/tags')
    .get(authorize({ permission: PERMISSIONS.TAGS_READ }), addConfig(TagsRoutes.getTags))
    .put(authorize({ permission: PERMISSIONS.TAGS_WRITE }), addConfig(TagsRoutes.saveTags));

  app.post('/apps', authorize({ permission: PERMISSIONS.ADMIN }), addConfig(AppsRoutes.createApp));

  return app;
}
