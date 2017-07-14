import fs from 'fs';
import path from 'path';
import _ from 'highland';
import glob from 'glob';
import { promisify } from 'bluebird';

const globAsync = promisify(glob);
const readFile = _.wrapCallback(fs.readFile);

export default async function (repoDir) {
  const fileNames = await globAsync(path.join(repoDir, 'meta/**/*.json'));

  return new Promise((resolve, reject) => {
    const manifests = [];
    _(fileNames)
      .map(readFile)
      .parallel(10)
      .map(x => JSON.parse(x.toString()))
      .filter(x => x.key_path)
      .on('error', err => reject(err))
      .on('data', x => manifests.push(x))
      .on('end', () => resolve(manifests));
  });
}
