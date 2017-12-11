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

function createDependencyIndexes(manifests) {
  const aliases = manifests.filter((manifest: any) => manifest.implementation.type === 'alias')
    .reduce((acc, manifest) => ({ ...acc, [manifest.key_path]: manifest.implementation.key }), {});

  const getKey = key => key in aliases ? getKey(aliases[key]) : key;

  const createAliasIndex = R.pipe(
    R.map(getKey),
    R.invert,
  );

  const aliasIndex = createAliasIndex(aliases);

  const indexDependencies = R.pipe(
    R.filter((manifest: any) => !!manifest.dependencies && manifest.implementation.type !== 'alias'),
    R.chain(R.pipe(
      R.props(['key_path', 'dependencies']),
      ([keyPath, dependencies]: [any, any]) => dependencies.map(dependency => ({ dependency: getKey(dependency), keyPath })),
    )),
    R.groupBy(R.prop('dependency')),
    <any>R.map(R.map(R.prop('keyPath'))),
    R.map(R.uniq),
  );

  const dependencyIndex = indexDependencies(manifests);

  return { aliasIndex, dependencyIndex };
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
    return dependentsPromise.then(({ aliasIndex, dependencyIndex }) => ({ usedBy: dependencyIndex[key] || [], aliases: aliasIndex[key] || [] }));
  },
  refreshIndex: (repoDir) => {
    indexPromise = refreshIndex(repoDir);
    manifestPromise = getManifests(repoDir);
    dependentsPromise = manifestPromise.then(createDependencyIndexes);

    return indexPromise;
  },
};
