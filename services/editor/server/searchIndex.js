import fs from 'fs';
import { execFile } from 'child_process';
import lunr from 'lunr';
import { promisify } from 'bluebird';

const readFile = promisify(fs.readFile);

let index;
let manifests;

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
  manifests = obj.manifests;
}

export default {
  get index() {
    return index;
  },
  get manifests() {
    return manifests;
  },
  refreshIndex,
};
