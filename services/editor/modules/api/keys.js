import { UKNOWN_AUTHOR } from './unknownAuthor';
import R from 'ramda';

const DEPENDENT_KEY_PREFIX = '@@key:';

function getDependenciesFromMatcher(matcher) {
  return Object.keys(matcher).filter(x => x.startsWith(DEPENDENT_KEY_PREFIX)).map(x => x.substring(DEPENDENT_KEY_PREFIX.length));
}

function getDependencies(rules, depth) {
  if (depth == 0) {
    return R.chain(getDependenciesFromMatcher, rules.filter(r => r.Matcher).map(r => r.Matcher));
  }
  return Object.keys(rules).map(key => rules[key]).reduce((result, rule) => result.concat(getDependencies(rule, depth - 1)), []);
}

function generateMetaForKey(keyPath, {keyDef, meta}) {
  const source = JSON.parse(keyDef.source);
  const dependencies = R.uniq(getDependencies(source.rules, source.partitions.length));

  return {
    key_path: keyPath,
    meta: {
      name: meta.displayName,
      tags: meta.tags,
      description: meta.description,
      archived: meta.archived,
    },
    implementation: {
      type: 'file',
      format: keyDef.type,
    },
    valueType: meta.valueType,
    dependencies,
    enabled: true,
  };
}

function retrieveMetaForKey(meta) {
  if (meta.meta == undefined) return meta;
  const {meta: newMeta} = meta;
  return {
    displayName: newMeta.name,
    description: newMeta.description,
    tags: newMeta.tags,
    valueType: meta.valueType,
    archived: newMeta.archived,
    enabled: meta.enabled,
  }
}

let injectAuthor = (fn) => function (req, res, deps, ...rest) {
  return this::fn(req, res, {
    author: (req.user && req.user.email && {
      name: req.user.displayName || req.user.email,
      email: req.user.email
    }) || UKNOWN_AUTHOR,
    ...deps
  }, ...rest);
};

export async function getKey(req, res, { keysRepository }, { params }) {
  const keyPath = params.splat;
  const revision = req.query.revision;
  try {
    const keyDetails = await keysRepository.getKeyDetails(keyPath, { revision });
    res.json({...keyDetails, meta: retrieveMetaForKey(keyDetails.meta)});
  } catch (exp) {
    res.sendStatus(404);
  }
}

export const saveKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;

  let keyRulesSource = req.body.keyDef.source;
  const meta = generateMetaForKey(keyPath, req.body);
  let keyMetaSource = JSON.stringify(meta, null, 4);
  await keysRepository.updateKey(keyPath, keyMetaSource, keyRulesSource, author);

  res.send('OK');
});

export const deleteKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
});