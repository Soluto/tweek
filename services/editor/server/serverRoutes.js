import express from 'express';
import * as KeysRoutes from './api/keys';
import * as TypesRoutes from './api/types';
import * as TagsRoutes from './api/tags';
import * as ContextRoutes from './api/context';
import * as SearchRoutes from './api/search';

export default (config) => {
  const app = express();

  const addConfig = fn => (req, res) => fn(req, res, config, { params: req.params });

  app.use((req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
  });

  app.route('/tags').get(addConfig(TagsRoutes.getTags)).put(addConfig(TagsRoutes.saveTags));

  app.get('/types', addConfig(TypesRoutes.getTypes));

  app.get('/context-schema', addConfig(ContextRoutes.getContextSchema));

  app
    .route('/context/:identityName/:identityId')
    .get(addConfig(ContextRoutes.getContext))
    .post(addConfig(ContextRoutes.updateContext));

  app.get('/keys', addConfig(KeysRoutes.getAllKeys));
  app
    .route('/keys/*')
    .get(addConfig(KeysRoutes.getKey))
    .put(addConfig(KeysRoutes.saveKey))
    .delete(addConfig(KeysRoutes.deleteKey));

  app.get('/manifests/*', addConfig(KeysRoutes.getKeyManifest));

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));

  app.use('/*', (req, res) => res.sendStatus(404));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
  });

  return app;
};
