import fs from 'fs';
import { execFile } from 'child_process';
import lunr from 'lunr';
import { promisify } from 'bluebird';

const readFile = promisify(fs.readFile);

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

  let stringIndex = await readFile(indexFile);
  index = lunr.Index.load(JSON.parse(stringIndex));
}

export default {
  get index() {
    return index;
  },
  refreshIndex,
};
