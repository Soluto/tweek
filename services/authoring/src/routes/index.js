const express = require('express');
const { compose } = require('ramda');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');
const includeAuthor = require('../utils/include-author');
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

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', addConfig(SearchRoutes.search));
  app.get('/suggestions', addConfig(SearchRoutes.getSuggestions));

  return app;
}

module.exports = configureRoutes;
