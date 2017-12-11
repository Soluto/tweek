const R = require('ramda');
const { Observable } = require('rxjs');

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
        };
        switch (manifest.implementation.type) {
        case 'file': {
          const { format, extension } = manifest.implementation;
          keyDef.format = format;
          keyDef.payload = await index[
            `implementations/${format}/${manifest.key_path}.${extension || format}`
          ].read();
          break;
        }
        case 'const': {
          keyDef.format = 'const';
          keyDef.payload = JSON.stringify(manifest.implementation.value);
          break;
        }
        case 'link': {
          keyDef.format = 'link';
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
