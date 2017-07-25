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

  return globAsync(path.join(repoDir, 'manifests/**/*.json')).catch(console.error).then(fileNames =>
    Rx.Observable
      .create((observer) => {
        _(fileNames)
          .map(readFile)
          .parallel(10)
          .map(x => JSON.parse(x.toString()))
          .filter(x => x.key_path)
          .on('error', err => observer.error(err))
          .on('data', x => observer.next(x))
          .on('end', () => observer.complete());
      })
      .do(({ key_path: id, meta }) => builder.add(Object.assign({}, meta, { id })))
      .toArray()
      .map(manifests => ({ manifests, index: builder.build() }))
      .toPromise()
  );
};
