const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const bodyParser = require('body-parser');
const routes = require('./routes');

nconf.argv().env().defaults({
  PORT: 3000,
});

const PORT = nconf.get('PORT');

async function startServer() {
  const app = express();
  app.use(morgan('tiny'));
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  app.use(routes({ }));
  app.use('/*', (req, res) => res.sendStatus(404));

  app.use((err, req, res, next) => {
    console.error(req.method, res.originalUrl, err);
    res.status(500).send(err.message);
  });

  app.listen(PORT, () => console.log('Listening on port', PORT));
}

startServer();
