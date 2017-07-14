import fs from 'fs';
import { execFile } from 'child_process';
import lunr from 'lunr';
import { promisify } from 'bluebird';
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
    manifestPromise = getManifestsFromFiles(repoDir);
    indexPromise = refreshIndex(repoDir);
    dependentsPromise = manifestPromise.then(x =>
      x
        .filter(current => current.dependencies && current.dependencies.length !== 0)
        .reduce((acc, current) => {
          current.dependencies.forEach((dependency) => {
            acc[dependency] = acc[dependency] || [];
            acc[dependency].push(current.key_path);
          });
          return acc;
        }, {}),
    );

    return indexPromise;
  },
};
