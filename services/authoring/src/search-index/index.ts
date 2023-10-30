import path from 'path';
import { execFile } from 'child_process';
import fs from 'fs-extra';
import * as R from 'ramda';
import lunr from 'lunr';
import { getManifests } from './get-manifests';
import logger from '../utils/logger';
import { KeyManifest } from '../types';

let manifestPromise: Promise<KeyManifest[]>;
let indexPromise: Promise<lunr.Index>;
let dependentsPromise;
let index: lunr.Index;

async function refreshIndex(repoDir: string) {
  const indexFile = './searchIndex.json';

  await new Promise<void>((resolve, reject) => {
    execFile('node', [path.join(__dirname, 'build/cli.js'), repoDir, indexFile], (error, stdout, stderr) => {
      logger.info({ stdout, stderr }, 'finished indexing');

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  const stringIndex = await fs.readFile(indexFile);
  const obj = JSON.parse(stringIndex.toString());

  index = lunr.Index.load(obj.index);

  return index;
}

function createDependencyIndexes(manifests: KeyManifest[]) {
  const aliases = manifests
    .filter((manifest) => manifest.implementation.type === 'alias')
    .reduce(
      (acc, manifest) => ({ ...acc, [manifest.key_path]: manifest.implementation.key }),
      {} as Record<string, string>,
    );

  const getKey = (key: string): string => (key in aliases ? getKey(aliases[key]) : key);

  const aliasIndex = R.pipe(R.map<Record<string, string>, Record<string, string>>(getKey), R.invert)(aliases);

  const filteredManifests = R.filter(
    (manifest: KeyManifest) => !!manifest.dependencies && manifest.implementation.type !== 'alias',
  )(manifests);
  const dependencies = R.chain(
    R.pipe(R.props(['key_path', 'dependencies']), ([keyPath, dependencies]: [string, string[]]) =>
      dependencies.map((dependency) => ({ dependency: getKey(dependency), keyPath })),
    ),
  )(filteredManifests);
  const dependencyGroups = R.groupBy(R.prop<string>('dependency'))(dependencies) as Record<
    string,
    {
      dependency: string;
      keyPath: string;
    }[]
  >;

  const keyPathArr = R.map<Record<string, { dependency: string; keyPath: string; }[]>, any>(R.map(R.prop<string>('keyPath')))(dependencyGroups);

  const dependencyIndex = R.map(R.uniq)(keyPathArr);

  return { aliasIndex, dependencyIndex };
}

export default {
  get indexPromise(): Promise<lunr.Index> {
    return indexPromise;
  },
  get manifests() {
    return manifestPromise;
  },
  get index(): lunr.Index {
    return index;
  },
  dependents(key: string) {
    return dependentsPromise.then(({ aliasIndex, dependencyIndex }) => ({
      usedBy: dependencyIndex[key] || [],
      aliases: aliasIndex[key] || [],
    }));
  },
  refreshIndex: (repoDir: string) => {
    const makeRef = (x) => () => x;
    indexPromise = refreshIndex(repoDir).catch(makeRef(indexPromise));
    manifestPromise = getManifests(repoDir).catch(makeRef(manifestPromise));
    dependentsPromise = manifestPromise.then(createDependencyIndexes);

    return indexPromise;
  },
};
