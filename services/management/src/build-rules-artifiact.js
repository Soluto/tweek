const R = require('ramda');
const { Observable } = require('rxjs');
const jsonminify = require('jsonminify');

const indexByName = R.indexBy(R.prop('name'));

module.exports = function (files) {
  const manifestFiles = files.filter(x => x.name.startsWith('manifests/'));
  const index = indexByName(files);
  return Observable.from(manifestFiles)
    .flatMap(file => Observable.defer(file.read))
    .map(x => JSON.parse(x))
    .map(manifest =>
      Observable.defer(async () => {
        const keyDef = {
          dependencies: manifest.dependencies,
          format: manifest.implementation.format || manifest.implementation.type,
        };
        switch (manifest.implementation.type) {
        case 'file': {
          const { format, extension } = manifest.implementation;
          keyDef.payload = await index[
            `implementations/${format}/${manifest.key_path}.${extension || format}`
          ].read();
          if (format === 'jpad') {
            keyDef.payload = jsonminify(keyDef.payload);
          }
          break;
        }
        case 'const': {
          keyDef.payload = JSON.stringify(manifest.implementation.value);
          break;
        }
        case 'alias': {
          keyDef.payload = manifest.implementation.key;
          keyDef.dependencies = [manifest.implementation.key];
          break;
        }
        }
        return [manifest.key_path, keyDef];
      }),
    )
    .mergeAll(10)
    .toArray()
    .map(R.fromPairs)
    .toPromise();
};
