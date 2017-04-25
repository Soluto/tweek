const _ = require('lodash');
const JSZip = require('jszip');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
const validationUrl = nconf.get('VALIDATION_URL');
const DEPENDENT_KEY_PREFIX = '@@key:';

function getDependenciesFromMatcher(matcher) {
  return Object.keys(matcher).filter(x => x.startsWith(DEPENDENT_KEY_PREFIX)).map(x => x.substring(DEPENDENT_KEY_PREFIX.length));
}

function calculateDependencies(rules, depth) {
  if (depth == 0) {
      return _.flatMap(rules.filter(r => r.Matcher).map(r => r.Matcher), getDependenciesFromMatcher);
  }
  return Object.keys(rules).map(k => rules[k]).reduce((result, rule) => result.concat(calculateDependencies(rule, depth - 1)), []);
}

function getDependencies(meta, rule) {
    if (!meta) return [];
    if (meta.meta) return meta.dependencies;
    const rulesObj = JSON.parse(rule);
    return calculateDependencies(rulesObj.rules || rulesObj, rulesObj.partitions? rulesObj.partitions.length : 0);
}

module.exports = function (data) {
    var fetchStartTime;
    if (!validationUrl) {
        throw 'missing rules validation url';
    }

    return Promise.resolve(data)
        .then(data => new JSZip().loadAsync(data))
        .then(folder => {
            const filteredFiles = _.values(folder.files)
                .filter(file => file.name.startsWith('rules') || file.name.startsWith('meta'))
                .filter(file => !file.dir)
                .map(file => {
                    const name = file.name.replace(/\\/g, '/').replace(/.j(pad|son)/g, '');
                    const index = name.indexOf('/');
                    return {
                        key: name.substring(index + 1),
                        type: name.substring(0, index),
                        file,
                    };
                });

            const groupedFiles = _.groupBy(filteredFiles, 'key');

            return Object.keys(groupedFiles)
                .filter(key => groupedFiles[key].some(x => x.type == 'rules'))
                .map(key => ({ key, files: groupedFiles[key].map(x => x.file.async('string').then(contents => [x.type, contents])) }))
                .map(x => 
                    Promise.all(x.files)
                        .then(pairs => _.fromPairs(pairs))
                        .then(result => [x.key, { format: 'jpad', payload: result.rules, dependencies: getDependencies(result.meta, result.rules)}])
                );
        })
        .then(promises => Promise.all(promises))
        .then(pairs => _.fromPairs(pairs))
        .then(ruleset => {
            logger.info('new ruleset was bundled');
            return ruleset;
        })
        .then(ruleset => {
            fetchStartTime = Date.now();
            return ruleset;
        })
        .then(ruleset => fetch(validationUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ruleset) }))
        .then(ruleset => {
            logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime });
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