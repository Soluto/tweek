const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nconf = require('nconf');
nconf
  .use('memory')
  .argv()
  .env()
  .file({ file: `${process.cwd()}/config.json` })
  .defaults({
    MINIO_SECURE: 'false',
    MINIO_BUCKET: 'tweek-ruleset',
    MINIO_REGION: 'us-east-1',
    GIT_SAMPLE_INTERVAL: 5000,
  });
const rulesCache = require('./rules-cache');
const repoValidator = require('./repo-validator');
const logger = require('./logger');
app.use(morgan('dev'));
app.set('port', process.env.PORT || 3000);

app.post('/on-repo-change', upload.any(), (req, res) => {
  logger.info('on-repo-change called');
  const startTime = Date.now();

  readFile(req.files[0].path, 'binary')
    .then(data => repoValidator(data))
    .then((result) => {
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
    .catch((err) => {
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
  res.contentType('application/json');
  res.send(rulesCache.getLatestFormattedRules());
});

app.get('/ruleset/latest/version', (req, res) => {
  if (!rulesCache.getLatestRulesVersion()) {
    res.status(503).send('Git repository not ready yet');
    return;
  }

  res.contentType('text/plain');
  res.send(rulesCache.getLatestRulesVersion());
});

app.get('/isalive', bodyParser.json(), (req, res) => res.send('alive'));

app.get('/version', (req, res) => res.send(process.env.npm_package_version));
app.get('/health', (req, res) => {
  const repoReady = !!rulesCache.getLatestRulesVersion();
  res.status(repoReady ? 200 : 503);
  res.json({
    repoReady: repoReady,
    rulesVersion: repoReady ? rulesCache.getLatestRulesVersion() : undefined,
    healthy: repoReady,
  });
});

rulesCache.buildLocalCache();

app.listen(app.get('port'), () =>
  logger.info(`Server started: http://localhost:${app.get('port')}/`),
);
