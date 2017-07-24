const express = require('express');
const { compose } = require('ramda');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');
const includeAuthor = require('../utils/include-author');
const passport = require('passport');

const KeysRoutes = require('./keys');
const SchemaRoutes = require('./schema');
const TagsRoutes = require('./tags');
const SearchRoutes = require('./search');
const AppsRoutes = require('./apps');

const auth = passport.authenticate(['tweek-internal', 'apps-credentials'], { session: false });

function configureRoutes(config) {
  const app = express();

  const addConfig = compose(
    requestErrorHandlingWrapper,
    fn => (req, res) => fn(req, res, config),
    includeAuthor,
  );

  app.get('/keys', addConfig(KeysRoutes.getAllKeys));
  app
    .route('/keys/*')
    .all(auth)
    .get(addConfig(KeysRoutes.getKey))
    .put(addConfig(KeysRoutes.updateKey))
    .delete(addConfig(KeysRoutes.deleteKey));

  app.get('/revision', auth, addConfig(KeysRoutes.getRevision));
  app.get('/revision-history/*', auth, addConfig(KeysRoutes.getKeyRevisionHistory));

  app.get('/manifests', auth, addConfig(KeysRoutes.getAllManifests));
  app.get('/manifests/*', auth, addConfig(KeysRoutes.getManifest));
  app.get('/dependents/*', auth, addConfig(KeysRoutes.getDependents));

  app.get('/schema', auth, addConfig(SchemaRoutes.getSchemas));
  app
    .route('/schema/:identityType')
    .all(auth)
    .patch(addConfig(SchemaRoutes.patchIdentity))
    .post(addConfig(SchemaRoutes.addIdentity))
    .delete(addConfig(SchemaRoutes.deleteIdentity));

  app.get('/search-index', auth, addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', auth, addConfig(SearchRoutes.search));
  app.get('/suggestions', auth, addConfig(SearchRoutes.getSuggestions));

  app
    .route('/tags')
    .all(auth)
    .get(addConfig(TagsRoutes.getTags))
    .put(addConfig(TagsRoutes.saveTags));

  app.post(
    '/apps/new',
    passport.authenticate('tweek-internal', { session: false }),
    addConfig(AppsRoutes.createApp),
  );

  return app;
}

module.exports = configureRoutes;
