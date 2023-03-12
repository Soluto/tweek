import {join } from 'path';
import _ from 'highland';
import glob from 'glob';
import { KeyManifest } from '../types';
const readFile = _.wrapCallback(require('fs').readFile);

export async function getManifests(repoDir: string): Promise<KeyManifest[]> {
  const fileNames = await glob(join(repoDir, 'manifests/**/*.json'));

  return new Promise((resolve, reject) => {
    const manifests = [];
    _(fileNames)
      .map(readFile)
      .parallel(10)
      .map((x) => JSON.parse(x.toString()))
      .filter((x) => x.key_path)
      .on('error', (err) => reject(err))
      .on('data', (x) => manifests.push(x))
      .on('end', () => resolve(manifests));
  });
}
