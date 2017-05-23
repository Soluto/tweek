const _ = require('lodash');
const JSZip = require('jszip');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');
const Rx = require('rxjs');
const buildRulesArtifiact = require('./build-rules-artifiact')

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
            return fetch(validationUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ruleset) });
        })
        .then(response => {
            logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime })
            checkStatus(response);
            return response.json();
        });
};

const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};