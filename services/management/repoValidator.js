const _ = require('lodash');
const JSZip = require('jszip');
const Promise = require('bluebird');
const logger = require('./logger');
const nconf = require('nconf');
const Rx = require('rxjs');
const getAuthenticatedClient = require('./auth/getAuthenticatedClient');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
const validationUrl = nconf.get('VALIDATION_URL');

function getAllGroups(str, pattern, groupIndex) {
    const result = [];
    const regex = new RegExp(pattern, 'g');
    var match;

    while (match = regex.exec(str)) {
        result.push(match[groupIndex]);
    }

    return result;
}

function getDependencies(meta, rule) {
    if (!meta) return [];
    if (meta.meta) return meta.dependencies;
    return _.uniq(getAllGroups(rule, /"(?:keys\.|@@key:)(.+?)"/, 1));
}

module.exports = function (data) {
    var fetchStartTime;
    if (!validationUrl) {
        throw 'missing rules validation url';
    }

    return Rx.Observable.fromPromise(new JSZip().loadAsync(data))
        .flatMap(folder => {
            const filteredFiles = _.values(folder.files)
                .filter(file => file.name.startsWith('rules') || file.name.startsWith('meta'))
                .filter(file => !file.dir)
                .map(file => {
                    const name = file.name.replace(/\\/g, '/').replace(/.j(pad|son)/g, '');
                    const splitName = name.split('/');
                    return {
                        key: splitName.slice(1).join('/'),
                        folder: splitName[0],
                        file,
                    };
                });
            
            const groupedFiles = _.groupBy(filteredFiles, 'key');

            return Rx.Observable.from(Object.keys(groupedFiles))
                .filter(key => groupedFiles[key].some(x => x.folder == 'rules'))
                .flatMap(key => Rx.Observable.defer(() => {
                    const filesPromise = groupedFiles[key].map(x => x.file.async('string').then(contents => [x.folder, contents]));
                    return Promise.all(filesPromise)
                        .then(pairs => _.fromPairs(pairs))
                        .then(result => [key, { format: 'jpad', payload: result.rules, dependencies: getDependencies(result.meta, result.rules)}])
                }), 10)
                .toArray();
        })
        .map(pairs => _.fromPairs(pairs))
        .do(_ => logger.info('new ruleset was bundled'))
        .do(_ => fetchStartTime = Date.now())
        .flatMap(ruleset =>
          getAuthenticatedClient({headers: { 'Content-Type': 'application/json' }}).then(client =>
            client.post(validationUrl, JSON.stringify(ruleset))
          )
        )
        .do(_ => logger.info('finished request to validate rules', { timeToFetch: Date.now() - fetchStartTime }))
        .map(response => response.data)
        .toPromise();
};
