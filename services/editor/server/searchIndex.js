import fs from 'fs';
import { execFile } from 'child_process';
import lunr from 'lunr';
import { promisify } from 'bluebird';

const readFile = promisify(fs.readFile);

let indexPromise;

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

  return {
    index: lunr.Index.load(obj.index),
    manifests: obj.manifests,
  };
}

export default {
  get index() {
    return indexPromise && indexPromise.then(x => x.index);
  },
  get manifests() {
    return indexPromise && indexPromise.then(x => x.manifests);
  },
  refreshIndex: (...args) => (indexPromise = refreshIndex(...args)),
};
