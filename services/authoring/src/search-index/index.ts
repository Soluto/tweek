import path = require('path');
import { execFile } from 'child_process';
import fs = require('fs-extra');
import R = require('ramda');
import lunr = require('lunr');
import { getManifests } from './get-manifests';

let manifestPromise;
let indexPromise;
let dependentsPromise;
let index;

async function refreshIndex(repoDir) {
  const indexFile = './searchIndex.json';

  await new Promise((resolve, reject) => {
    execFile('node', [path.join(__dirname, 'build/cli.js'), repoDir, indexFile], (error, stdout, stderr) => {
      console.log(stdout);
      if (error) reject(error);
      else resolve();
    });
  });

  const stringIndex = await fs.readFile(indexFile);
  const obj = JSON.parse(stringIndex.toString());

  index = lunr.Index.load(obj.index);

  return index;
}

const indexDependencies = R.pipe(
  R.filter((manifest: any) => !!manifest.dependencies),
  R.chain(R.pipe(
    R.props(['key_path', 'dependencies']),
    ([keyPath, dependencies]: [any, any]) => dependencies.map(dependency => ({ dependency, keyPath })),
  )),
  R.groupBy(R.prop('dependency')),
  <any>R.map(R.map(R.prop('keyPath'))),
);

export default {
  get indexPromise() {
    return indexPromise;
  },
  get manifests() {
    return manifestPromise;
  },
  get index() {
    return index;
  },
  dependents(key) {
    return dependentsPromise.then(x => x[key] || []);
  },
  refreshIndex: (repoDir) => {
    indexPromise = refreshIndex(repoDir);
    manifestPromise = getManifests(repoDir);
    dependentsPromise = manifestPromise.then(indexDependencies);

    return indexPromise;
  },
};
