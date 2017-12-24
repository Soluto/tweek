const R = require('ramda');
const JSZip = require('jszip');
const logger = require('./logger');
const nconf = require('nconf');
const buildRulesArtifiact = require('./build-rules-artifiact');
const getAuthenticatedClient = require('./auth/getAuthenticatedClient');

async function getAllFileHandlers(data) {
  const root = await new JSZip().loadAsync(data);
  const files = R.values(root.files).filter(file => !file.dir);
  return files.map(file => ({
    name: file.name,
    read: () => file.async('string'),
  }));
}

module.exports = async function (data) {
  const validationUrl = nconf.get('VALIDATION_URL');
  if (!validationUrl) {
    throw 'missing rules validation url';
  }
  let files = await getAllFileHandlers(data);
  let ruleset = await buildRulesArtifiact(files);
  logger.info('new ruleset was bundled');
  let fetchStartTime = Date.now();
  let client = await getAuthenticatedClient({ headers: { 'Content-Type': 'application/json' } });
  let response = await client.post(validationUrl, JSON.stringify(ruleset));
  logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime });
  return response.data;
};
