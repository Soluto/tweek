import express from 'express';
import * as TypesRoutes from './api/types';
import * as ContextRoutes from './api/context';
import * as Registration from './api/registration';
import * as EditorConfiguration from './api/editorConfiguration';
import proxyRequest from './api/utils/proxy-request';
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default (config) => {
  const app = express();

  const addConfig = fn =>
    requestErrorHandlingWrapper((req, res) => fn(req, res, config, { params: req.params }));

  const authoringProxy = proxyRequest(`${config.authoringApiHostname}`);

  app.route('/tags').get(authoringProxy).put(authoringProxy);

  app.get('/types', addConfig(TypesRoutes.getTypes));

  app.get('/schemas', authoringProxy);

  app
    .route('/context/:identityType/:identityId')
    .get(addConfig(ContextRoutes.getContext))
    .patch(addConfig(ContextRoutes.updateContext));

  app.get('/keys', authoringProxy);
  app
    .route('/keys/*')
    .get(authoringProxy)
    .put(authoringProxy)
    .delete(authoringProxy);

  app.get('/editor-configuration/*', addConfig(EditorConfiguration.getConfiguration));

  app.get('/revision', authoringProxy);
  app.get('/revision-history/*', authoringProxy);

  app.get('/manifests', authoringProxy);
  app.get('/manifests/*', authoringProxy);
  app.get('/dependents/*', authoringProxy);

  app.get('/search-index', authoringProxy);
  app.get('/search', authoringProxy);
  app.get('/suggestions', authoringProxy);
  app
    .route('/schemas/:identityType')
    .patch(authoringProxy)
    .post(authoringProxy)
    .delete(authoringProxy);

  app.get('/push-service/public-key', addConfig(Registration.getPublicKey));
  app.post('/push-service/register', addConfig(Registration.register));

  app.use('/*', (req, res) => res.sendStatus(404));

  return app;
};
