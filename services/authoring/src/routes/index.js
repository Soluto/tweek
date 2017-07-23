const express = require('express');
const { compose } = require('ramda');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');
const includeAuthor = require('../utils/include-author');

const KeysRoutes = require('./keys');
const SchemaRoutes = require('./schema');
const TagsRoutes = require('./tags');
const SearchRoutes = require('./search');

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
    .get(addConfig(KeysRoutes.getKey))
    .put(addConfig(KeysRoutes.updateKey))
    .delete(addConfig(KeysRoutes.deleteKey));

  app.get('/revision', addConfig(KeysRoutes.getRevision));
  app.get('/revision-history/*', addConfig(KeysRoutes.getKeyRevisionHistory));

  app.get('/manifests', addConfig(KeysRoutes.getAllManifests));
  app.get('/manifests/*', addConfig(KeysRoutes.getManifest));
  app.get('/dependents/*', addConfig(KeysRoutes.getDependents));

  app.get('/schema', addConfig(SchemaRoutes.getSchemas));
  app
    .route('/schema/:identityType')
    .patch(addConfig(SchemaRoutes.patchIdentity))
    .post(addConfig(SchemaRoutes.addIdentity))
    .delete(addConfig(SchemaRoutes.deleteIdentity));

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', addConfig(SearchRoutes.search));
  app.get('/suggestions', addConfig(SearchRoutes.getSuggestions));

  app
    .route('/tags')
    .get(addConfig(TagsRoutes.getTags))
    .put(addConfig(TagsRoutes.saveTags));

  return app;
}

module.exports = configureRoutes;
