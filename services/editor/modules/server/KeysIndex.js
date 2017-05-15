import searchIndex from 'search-index';
import glob from 'glob';
import {promisify} from 'bluebird';
import _ from 'highland';
import fs from 'fs';
import path from 'path';

const searchIndexAsync = promisify(searchIndex);
const globAsync = promisify(glob);
const readFile = _.wrapCallback(fs.readFile);

export default class KeysIndex {
  constructor(repoDir) {
    this._index = undefined;
    this._repoDir = repoDir;
  }

  async init(options = {}) {
    this._index = await searchIndexAsync(options);
    await this.refresh();
  }

  async refresh() {
    const files = await globAsync(path.join(this._repoDir, 'meta/**/*.json'));

    await new Promise((resolve) => {
      _(files)
        .map(readFile)
        .parallel(10)
        .map(({key_path: id, meta}) => ({id, ...meta}))
        .pipe(this._index.defaultPipeline())
        .pipe(this._index.add())
        .on('data', _ => {})
        .on('end', resolve);
    });
  }
}
