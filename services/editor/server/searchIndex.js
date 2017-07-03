import fs from 'fs';
import { execFile } from 'child_process';
import lunr from 'lunr';
import { promisify } from 'bluebird';
import getManifestsFromFiles from './getManifestsFromFiles';

const readFile = promisify(fs.readFile);

let manifestPromise;
let indexPromise;
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

  index = {
    index: lunr.Index.load(obj.index),
    manifests: obj.manifests,
  };

  return index;
}

export default {
  get indexPromise() {
    return indexPromise && indexPromise.then(x => x.index);
  },
  get manifests() {
    return manifestPromise;
  },
  get index() {
    return index;
  },
  refreshIndex: (repoDir) => {
    manifestPromise = getManifestsFromFiles(repoDir);
    indexPromise = refreshIndex(repoDir);
  },
};
