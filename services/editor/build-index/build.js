module.exports = function createIndex(repoDir) {
  const path = require('path');
  const promisify = require('bluebird').promisify;
  const glob = require('glob');
  const globAsync = promisify(glob);
  const Rx = require('rxjs');
  const _ = require('highland');
  const readFile = _.wrapCallback(require('fs').readFile);
  const lunr = require('lunr');

  const builder = new lunr.Builder();
  builder.pipeline.add(lunr.trimmer, lunr.stemmer);
  builder.searchPipeline.add(lunr.stemmer);
  builder.tokenizer.separator = /(?:[_/]|\s|-)/;

  builder.ref('id');
  builder.field('id');
  builder.field('description');
  builder.field('tags');
  builder.field('name');

  return globAsync(path.join(repoDir, 'meta/**/*.json')).catch(console.error).then(fileNames =>
    Rx.Observable
      .create((observer) => {
        _(fileNames)
          .map(readFile)
          .parallel(10)
          .map(x => JSON.parse(x.toString()))
          .filter(x => x.key_path)
          // .map(({ key_path: id, meta }) => ({ id, ...meta }))
          .map(({ key_path: id, meta }) => Object.assign({}, meta, { id }))
          .on('error', err => observer.error(err))
          .on('data', x => observer.next(x))
          .on('end', () => observer.complete());
      })
      .do(doc => builder.add(doc))
      .ignoreElements()
      .concat(Rx.Observable.defer(() => Rx.Observable.of(builder.build())))
      .toPromise()
  );
};
