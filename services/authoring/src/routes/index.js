const express = require('express');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');

const SearchRoutes = require('./search');

function configureRoutes(config) {
  const app = express();

  const addConfig = fn => requestErrorHandlingWrapper((req, res) => fn(req, res, config));

  app.get('/search-index', addConfig(SearchRoutes.getSearchIndex));
  app.get('/search', addConfig(SearchRoutes.search));
  app.get('/suggestions', addConfig(SearchRoutes.getSuggestions));

  return app;
}

module.exports = configureRoutes;
