#!/usr/bin/env node
const path = require('path');
const promisify = require('bluebird').promisify;
const writeFile = promisify(require('fs').writeFile);

const getOpt = require('node-getopt').create([['h', 'help', 'display this help']]).bindHelp();

getOpt.setHelp(
  `Usage: node ${path.basename(__filename)} <repository_dir> <output_file>\nOptions:\n[[OPTIONS]]`
);

const args = getOpt.parseSystem().argv;
if (args.length < 2) {
  getOpt.showHelp();
  process.exit(1);
}

const repoDir = args[0];
const indexFile = args[1];

const createIndex = require('./build');

console.log('indexing...');
createIndex(repoDir)
  .then(x => (console.log('index ready, writing file'), x))
  .then((index) => {
    const stringIndex = JSON.stringify(index);
    return writeFile(indexFile, stringIndex);
  })
  .then(() => (console.log('file written', indexFile), process.exit(0)))
  .catch(err => (console.error(err), process.exit(1)));
