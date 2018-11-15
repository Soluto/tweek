module.exports = function createIndex(repoDir) {
  const path = require('path');
  const promisify = require('util').promisify;
  const glob = promisify(require('glob'));
  const { Observable } = require('rxjs');
  const _ = require('highland');
  const readFile = _.wrapCallback(require('fs').readFile);
  const lunr = require('lunr');
  const R = require('ramda');

  const builder = new lunr.Builder();
  builder.pipeline.add(lunr.trimmer, lunr.stemmer);
  builder.searchPipeline.add(lunr.stemmer);
  builder.tokenizer.separator = /(?:[_/]|\s|-)/;

  builder.ref('id');
  builder.field('id');
  builder.field('description');
  builder.field('tags');
  builder.field('name');

  function mapToLower(obj) {
    return R.map(R.ifElse(R.is(String), R.toLower, mapToLower))(obj);
  }

  return glob(path.join(repoDir, 'manifests/**/*.json'))
    .catch(console.error)
    .then(fileNames =>
      Observable.create((observer) => {
        _(fileNames)
          .map(readFile)
          .parallel(10)
          .map(x => JSON.parse(x.toString()))
          .filter(x => x.key_path)
          .on('error', err => observer.error(err))
          .on('data', x => observer.next(x))
          .on('end', () => observer.complete());
      })
        .map(({ key_path: id, meta }) => Object.assign({}, meta, { id }))
        .map(mapToLower)
        .do(obj => builder.add(obj))
        .toArray()
        .map(manifests => ({ manifests, index: builder.build() }))
        .toPromise(),
    );
};
