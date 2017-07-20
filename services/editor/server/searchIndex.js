import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import R from 'ramda';
import lunr from 'lunr';
import getManifestsFromFiles from './getManifestsFromFiles';

const readFile = promisify(fs.readFile);

let manifestPromise;
let indexPromise;
let dependentsPromise;
let index;

async function refreshIndex(repoDir) {
  const indexFile = './searchIndex.json';

  await new Promise((resolve, reject) => {
    execFile('node', ['./build-index/cli.js', repoDir, indexFile], (error, stdout, stderr) => {
      console.log(stdout);
      if (error) reject(error);
      else resolve();
    });
  });

  const stringIndex = await readFile(indexFile);
  const obj = JSON.parse(stringIndex);

  index = lunr.Index.load(obj.index);

  return index;
}

const indexDependencies = R.pipe(
  R.filter(manifest => manifest.dependencies),
  R.chain(({ key_path, dependencies }) => dependencies.map(dependency => ([dependency, key_path]))),
  R.groupBy(([dependency]) => dependency),
  R.map(R.map(([, key_path]) => key_path)),
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
    manifestPromise = getManifestsFromFiles(repoDir);
    dependentsPromise = manifestPromise.then(indexDependencies);

    return indexPromise;
  },
};
