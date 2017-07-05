const R = require('ramda');
const { Observable } = require('rxjs');

const indexByName = R.indexBy(R.prop('name'));

module.exports = function (files) {
  const metaFiles = files.filter(x => x.name.startsWith('meta'));
  const index = indexByName(files);
  return Observable.from(metaFiles)
    .flatMap(file => Observable.defer(file.read))
    .map(JSON.parse)
    .map((meta) => Observable.defer(async () => {
      const keyDef = {
        dependencies: meta.dependencies
      };
      if (meta.implementation.type === "file") {
        let format = meta.implementation.format;
        keyDef.format = format;
        keyDef.payload = await index[`rules/${meta.key_path}.${format}`].read();
      }
      if (meta.implementation.type === "const") {
        keyDef.format = "const";
        keyDef.payload = JSON.stringify(meta.implementation.value);
      }
      return [meta.key_path, keyDef];
    }))
    .mergeAll(10)
    .toArray().map(R.fromPairs).toPromise();
};
