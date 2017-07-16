const R = require('ramda');
const { Observable } = require('rxjs');

const indexByName = R.indexBy(R.prop('name'));

module.exports = function(files) {
  //todo remove legacy support
  files = files.map(file =>
    Object.assign({}, file, {
      name: file.name.replace(/^meta\//, 'manifests/').replace(/^rules\//, 'implementations/jpad/'),
    }),
  );

  const metaFiles = files.filter(x => x.name.startsWith('manifests/'));
  const index = indexByName(files);
  return Observable.from(metaFiles)
    .flatMap(file => Observable.defer(file.read))
    .map(JSON.parse)
    .map(meta =>
      Observable.defer(async () => {
        const keyDef = {
          dependencies: meta.dependencies,
        };
        switch (meta.implementation.type) {
          case 'file': {
            const { format, extension } = meta.implementation;
            keyDef.format = format;
            keyDef.payload = await index[
              `implementations/${format}/${meta.key_path}.${extension || format}`
            ].read();
            break;
          }
          case 'const': {
            keyDef.format = 'const';
            keyDef.payload = JSON.stringify(meta.implementation.value);
            break;
          }
        }
        return [meta.key_path, keyDef];
      }),
    )
    .mergeAll(10)
    .toArray()
    .map(R.fromPairs)
    .toPromise();
};
