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
  get dependents() {
    return dependentsPromise;
  },
  refreshIndex: (repoDir) => {
    manifestPromise = getManifestsFromFiles(repoDir);
    indexPromise = refreshIndex(repoDir);
    dependentsPromise = indexPromise.then(x =>
      x.manifests.reduce((acc, current) => {
        if (current.dependencies && current.dependencies.length !== 0) {
          current.dependencies.forEach((dependency) => {
            acc[dependency] = acc[dependency] || new Set();
            acc[dependency].add(current.key_path);
          });
        }
        return acc;
      }, {}),
    );

    return indexPromise;
  },
};
