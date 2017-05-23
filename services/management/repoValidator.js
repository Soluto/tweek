const _ = require('lodash');
const JSZip = require('jszip');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');
const Rx = require('rxjs');
const buildRulesArtifiact = require('./build-rules-artifiact')
const getAuthenticatedClient = require('./auth/getAuthenticatedClient');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
const validationUrl = nconf.get('VALIDATION_URL');

const getAllFileHandlers = Promise.coroutine(function*(data){
    var root = yield (new JSZip().loadAsync(data));
    var files = _.values(root.files).filter(file => !file.dir);
    return files.map(file=>({
        name: file.name,
        read: ()=>file.async('string')
    }))
});

module.exports = function (data) {
    var fetchStartTime;
    if (!validationUrl) {
        throw 'missing rules validation url';
    }
  
    return getAllFileHandlers(data)
        .then(buildRulesArtifiact)
        .then(ruleset => {
            logger.info('new ruleset was bundled')
            fetchStartTime = Date.now()
            return getAuthenticatedClient({headers: { 'Content-Type': 'application/json' }}).then(client =>
                client.post(validationUrl, JSON.stringify(ruleset))
            )
        })
        .then(response => {
            logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime })
            return response.data;
        });
};
