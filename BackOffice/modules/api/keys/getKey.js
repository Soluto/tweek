import promisify from 'promisify-node';
const fs = promisify('fs');
import path from 'path';

export default function (req, res, { rulesRepository, metaRepository }, { params }) {
  const keyPath = params.splat;
  
  (async function() {
    return {
      ruleDef: {
        type: path.extname(keyPath).substring(1),
        source: (await rulesRepository.getRule(keyPath)).toString(),
      },
      meta: await metaRepository.getRuleMeta(keyPath),
    };}()).then((x)=> res.json(x), console.error.bind(console));
}
