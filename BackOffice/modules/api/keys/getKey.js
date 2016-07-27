import promisify from 'promisify-node';
const fs = promisify('fs');
import path from 'path';

export default function (req, res, { rulesRepository, metaRepository }, { params, location, route }) {
  const keyPath = params.splat;
  console.log(metaRepository);
  (async function() {
    return {
      ruleDef: {
        type: path.extname(keyPath).substring(1),
        source: (await rulesRepository.getRule(keyPath)).toString(),
      },
      meta: await metaRepository.getRuleMeta(keyPath),
    };}()).then(res.json.bind(res), console.error.bind(console));
}
