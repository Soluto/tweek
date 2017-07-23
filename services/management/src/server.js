const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const rulesCache = require('./rulesCache');
const repoValidator = require('./repoValidator');
const logger = require('./logger');

app.use(morgan('dev'));
app.set('port', process.env.PORT || 3000);

app.post('/on-repo-change', upload.any(), (req, res) => {
  logger.info('on-repo-change called');
  const startTime = Date.now();

  readFile(req.files[0].path, 'binary')
    .then(data => repoValidator(data))
    .then(result => {
      logger.info('on-repo-change completed', {
        timeSinceStart: Date.now() - startTime,
        isSuccessful: result === true,
      });
      if (result === true) {
        res.sendStatus(200);
      } else {
        res.status(400).send(result);
      }
    })
    .catch(err => {
      logger.error(err);
      res.status(500).send(err.response.data);
    });
});

app.get('', (req, res) => {
  res.sendStatus(200);
});

app.get('/ruleset/latest', (req, res) => {
  if (!rulesCache.getLatestRules()) {
    res.status(503).send('Git repository not ready yet');
    return;
  }

  res.header('X-Rules-Version', rulesCache.getLatestRulesVersion());
  res.contentType("application/json");
  res.json(rulesCache.getLatestFormattedRules());
});

app.get('/isalive', bodyParser.json(), (req, res) => res.send('alive'));

rulesCache.buildLocalCache();

app.listen(app.get('port'), () =>
  logger.info('Server started: http://localhost:' + app.get('port') + '/'),
);
