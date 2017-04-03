const _ = require('lodash');
const JSZip = require("jszip");
const fetch = require('node-fetch');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
const validationUrl = nconf.get('VALIDATION_URL');

module.exports = function (data) {
    var fetchStartTime;
    if (!validationUrl) {
        throw 'missing rules validation url';
    }

    return Promise.resolve(data)
        .then(data => new JSZip().loadAsync(data))
        .then(folder => _.values(folder.files)
            .filter(file => file.name.startsWith('rules'))
            .filter(file => !file.dir)
            .map(file =>
                file.async("string").then(contents => [file.name.replace(/\\/g, '/').replace(/.jpad/g, ''), { format: 'jpad', payload: contents }])
            ))
        .then(promises => Promise.all(promises))
        .then(pairs => _.fromPairs(pairs))
        .then(ruleset => {
            logger.info("new ruleset was bundled");
            return ruleset;
        })
        .then(ruleset => {
            fetchStartTime = Date.now();
            return ruleset;
        })
        .then(ruleset => fetch(validationUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ruleset) }))
        .then(ruleset => {
            logger.info("finished request to validate rules", { timeToFetch: Date.now() - fetchStartTime });
            return ruleset;
        })
        .then(checkStatus)
        .then(response => response.json())
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