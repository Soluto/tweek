const _ = require('lodash');
const Promise = require('bluebird');
const {Observable} = require('rxjs');

module.exports = function(files){
  var metaFiles = files.filter(x => x.name.startsWith("meta"));
  var index = _.keyBy(files, file => file.name);
  return Observable.from(metaFiles)
    .flatMap(file => Observable.defer(() => file.read()))
    .map(x=> {
        return typeof(x) === "object" ? x : JSON.parse(x)
    })
    .map((meta)=> Observable.defer(() => Promise.coroutine(function* (){
      try
      {
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
      }
      catch (ex){
        console.error(ex);
        return null;
      }
    
    })() ))
    .mergeAll(10)
    .catch(ex=> {
      console.error(ex)
    })
    .toArray().map(rulesList=>{
      return _.fromPairs(rulesList);
    }).toPromise();
}