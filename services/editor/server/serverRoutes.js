import express from 'express';
import * as KeysRoutes from './api/keys';
import * as TypesRoutes from './api/types';
import * as TagsRoutes from './api/tags';
import * as ContextRoutes from './api/context';
import * as SearchRoutes from './api/search';
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default ({ tagsRepository, keysRepository, tweekApiHostname }) => {
  const app = express();

  app
    .route('/tags')
    .get(requestErrorHandlingWrapper(TagsRoutes.getTags, { tagsRepository }))
    .put(requestErrorHandlingWrapper(TagsRoutes.saveTags, { tagsRepository }));

  app.get('/types', requestErrorHandlingWrapper(TypesRoutes.getTypes, { tweekApiHostname }));

  app.get(
    '/context-schema',
    requestErrorHandlingWrapper(ContextRoutes.getContextSchema, { tweekApiHostname }),
  );

  app
    .route('/context/:identityName/:identityId')
    .get(requestErrorHandlingWrapper(ContextRoutes.getContext, { tweekApiHostname }))
    .post(requestErrorHandlingWrapper(ContextRoutes.updateContext, { tweekApiHostname }));

  app.get('/keys', requestErrorHandlingWrapper(KeysRoutes.getAllKeys, { keysRepository }));
  app
    .route('/keys/*')
    .get(requestErrorHandlingWrapper(KeysRoutes.getKey, { keysRepository }))
    .put(requestErrorHandlingWrapper(KeysRoutes.saveKey, { keysRepository }))
    .delete(requestErrorHandlingWrapper(KeysRoutes.deleteKey, { keysRepository }));

  app.get('/manifests/*', requestErrorHandlingWrapper(KeysRoutes.getKeyManifest, { keysRepository }));

  app.get('/search-index', requestErrorHandlingWrapper(SearchRoutes.getSearchIndex));

  app.use('/*', (req, res) => res.sendStatus(404));

  return app;
};
