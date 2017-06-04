import fs from 'fs';
import path from 'path';
import lunr from 'lunr';
import Rx from 'rxjs';
import glob from 'glob';
import { promisify } from 'bluebird';
import _ from 'highland';

const globAsync = promisify(glob);
const readFile = _.wrapCallback(fs.readFile);

const separator = /(?:[_/]|\s)/;

let index;

async function refreshIndex(repoDir) {
  const fileNames = await globAsync(path.join(repoDir, 'meta/**/*.json'));

  const files = await Rx.Observable
    .create((observer) => {
      _(fileNames)
        .map(readFile)
        .parallel(10)
        .map(x => JSON.parse(x.toString()))
        .filter(x => x.key_path)
        .map(({ key_path: id, meta }) => ({ id, ...meta }))
        .on('error', err => observer.error(err))
        .on('data', x => observer.next(x))
        .on('end', () => observer.complete());
    })
    .toArray()
    .toPromise();

  index = lunr(function () {
    this.tokenizer.separator = separator;
    this.pipeline.remove(lunr.stopWordFilter);
    this.ref('id');
    this.field('id');
    this.field('description');
    this.field('tags');
    this.field('name');

    files.forEach(function (doc) {
      this.add(doc);
    }, this);
  });
}

export default {
  get index() {
    return index;
  },
  refreshIndex,
};
