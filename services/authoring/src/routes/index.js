const express = require('express');
const requestErrorHandlingWrapper = require('../utils/request-error-handling-wrapper');

function configureRoutes(config) {
  const app = express();

  const addConfig = fn => requestErrorHandlingWrapper((req, res) => fn(req, res, config));

  return app;
}

module.exports = configureRoutes;
