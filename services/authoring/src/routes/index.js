const express = require('express');
const { compose } = require('ramda');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');
const includeAuthor = require('../utils/include-author');

const KeysRoutes = require('./keys');
const SearchRoutes = require('./search');

function configureRoutes(config) {
  const app = express();

  function addConfig(fn, isAuthorRequired = false) {
    const wrapRequest = compose(
      requestErrorHandlingWrapper,
      fn => (req, res) => fn(req, res, config),
      includeAuthor(isAuthorRequired),
    );

    return wrapRequest(fn);
  }

  app.get('/keys', addConfig(KeysRoutes.getAllKeys));
  app
    .route('/keys/*')
    .get(addConfig(KeysRoutes.getKey))
    .put(addConfig(KeysRoutes.updateKey, true))
    .delete(addConfig(KeysRoutes.deleteKey, true));

  app.get('/revision', addConfig(KeysRoutes.getRevision));
  app.get('/revision-history/*', addConfig(KeysRoutes.getKeyRevisionHistory));

  app.get('/manifests', addConfig(KeysRoutes.getAllManifests));
  app.get('/manifests/*', addConfig(KeysRoutes.getManifest));
  app.get('/dependents/*', addConfig(KeysRoutes.getDependents));

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', addConfig(SearchRoutes.search));
  app.get('/suggestions', addConfig(SearchRoutes.getSuggestions));

  return app;
}

module.exports = configureRoutes;
