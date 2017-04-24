const _ = require('lodash');
const JSZip = require("jszip");
const fetch = require('node-fetch');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
const validationUrl = nconf.get('VALIDATION_URL');
const DEPENDENT_KEY_PREFIX = '@@key:';

function normalizeFileName(name) {
    return name.replace(/\\/g, '/').replace(/.j(pad|son)/g, '');
}

function getValues(obj) {
    return Object.keys(obj).map(k => obj[k]);
}

function getDependenciesFromMatcher(matcher) {
  return Object.keys(matcher).filter(x => x.startsWith(DEPENDENT_KEY_PREFIX)).map(x => x.substring(DEPENDENT_KEY_PREFIX.length));
}

function calculateDependencies(rules, depth) {
  if (depth == 0) {
      return _.flatMap(rules.filter(r => r.Matcher).map(r => r.Matcher), getDependenciesFromMatcher);
  }
  return getValues(rules).reduce((result, rule) => result.concat(calculateDependencies(rule, depth - 1)), []);
}

function getDependencies(meta, rule) {
    if (meta && meta.meta) return meta.dependencies;
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
                    const name = normalizeFileName(file.name);
                    const index = name.indexOf('/');
                    const type = name.substring(0, index);
                    return {
                        name,
                        key: name.substring(index + 1),
                        type,
                        file: file.async("string").then(contents => [type, contents]),
                    };
                });

            const groupedFiles = _.groupBy(filteredFiles, 'key');

            return getValues(groupedFiles)
                .map(files => files.reduce((result, file) => Object.assign({}, result, {[file.type]: file}), {}))
                .filter(files => files.rules)
                .map(files => 
                    Promise.all(getValues(files).map(f => f.file))
                        .then(pairs => _.fromPairs(pairs))
                        .then(result => [files.rules.name, { format: 'jpad', payload: result.rules, dependencies: getDependencies(result.meta, result.rules)}])
                );
        })
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