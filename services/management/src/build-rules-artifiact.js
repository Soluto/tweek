const R = require('ramda');
const { Observable } = require('rxjs');

const indexByName = R.indexBy(R.prop('name'));

module.exports = function(files) {
  const metaFiles = files.filter(x => x.name.startsWith('manifests'));
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
            let format = meta.implementation.format;
            keyDef.format = format;
            keyDef.payload = await index[
              `implementations/${format}/${meta.key_path}.${meta.implementation.extension ||
                format}`
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
