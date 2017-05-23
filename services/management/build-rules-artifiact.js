const _ = require('lodash');
const Promise = require('bluebird');
const { Observable } = require('rxjs');

let spawn = (gen)=> Promise.coroutine(gen)();

module.exports = function (files) {
  var metaFiles = files.filter(x => x.name.startsWith("meta"));
  var index = _.keyBy(files, file => file.name);
  return Observable.from(metaFiles)
    .flatMap(file => Observable.defer(file.read))
    .map(JSON.parse)
    .map((meta) => Observable.defer(() => spawn(function* () {
      var keyDef = {
        dependencies: meta.dependencies
      }
      if (meta.implementation.type === "file") {
        let format = meta.implementation.format;
        keyDef.format = format;
        keyDef.payload = yield index[`rules/${meta.key_path}.${format}`].read();
      }
      if (meta.implementation.type === "const") {
        keyDef.format = "const";
        keyDef.payload = meta.implementation.value;
      }
      return [meta.key_path, keyDef];
    })))
    .mergeAll(10)
    .toArray().map(_.fromPairs).toPromise();
}