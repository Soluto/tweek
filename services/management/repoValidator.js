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

module.exports =  Promise.coroutine(function* (data){
    if (!validationUrl) {
        throw 'missing rules validation url';
    }
    let files = yield getAllFileHandlers(data);
    let ruleset = yield buildRulesArtifiact(files);
    logger.info('new ruleset was bundled')
    let fetchStartTime = Date.now()
    let client = yield getAuthenticatedClient({headers: { 'Content-Type': 'application/json' }});
    let response = yield client.post(validationUrl, JSON.stringify(ruleset))
    logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime })
    return response.data;
});
