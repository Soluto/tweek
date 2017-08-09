import express from 'express';
import * as KeysRoutes from './api/keys';
import * as TypesRoutes from './api/types';
import * as TagsRoutes from './api/tags';
import * as ContextRoutes from './api/context';
import * as SearchRoutes from './api/search';
import * as SchemaRoutes from './api/schema';
import * as Registration from './api/registration';
import * as EditorConfiguration from './api/editorConfiguration';
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default (config) => {
  const app = express();

  const addConfig = fn =>
    requestErrorHandlingWrapper((req, res) => fn(req, res, config, { params: req.params }));

  app.route('/tags').get(addConfig(TagsRoutes.getTags)).put(addConfig(TagsRoutes.saveTags));

  app.get('/types', addConfig(TypesRoutes.getTypes));

  app.get('/schema', addConfig(SchemaRoutes.getSchemas));

  app
    .route('/context/:identityName/:identityId')
    .get(addConfig(ContextRoutes.getContext))
    .patch(addConfig(ContextRoutes.updateContext));

  app.get('/keys', addConfig(KeysRoutes.getAllKeys));
  app
    .route('/keys/*')
    .get(addConfig(KeysRoutes.getKey))
    .put(addConfig(KeysRoutes.saveKey))
    .delete(addConfig(KeysRoutes.deleteKey));

  app.get('/editor-configuration/*', addConfig(EditorConfiguration.getConfiguration));

  app.get('/revision', addConfig(KeysRoutes.getRevision));
  app.get('/revision-history/*', addConfig(KeysRoutes.getKeyRevisionHistory));

  app.get('/manifests', addConfig(KeysRoutes.getAllManifests));
  app.get('/manifests/*', addConfig(KeysRoutes.getKeyManifest));
  app.get('/dependents/*', addConfig(KeysRoutes.getDependents));

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', addConfig(SearchRoutes.search));
  app.get('/suggestions', addConfig(SearchRoutes.getSuggestions));
  app
    .route('/schema/:identityType')
    .patch(addConfig(SchemaRoutes.patchIdentity))
    .post(addConfig(SchemaRoutes.addIdentity))
    .delete(addConfig(SchemaRoutes.deleteIdentity));

  app.get('/push-service/public-key', addConfig(Registration.getPublicKey));
  app.post('/push-service/register', addConfig(Registration.register));

  app.use('/*', (req, res) => res.sendStatus(404));

  return app;
};
