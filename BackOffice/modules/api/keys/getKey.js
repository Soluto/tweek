import promisify from 'promisify-node';
const fs = promisify('fs');
import path from 'path';

export default function (req, res, { repo }, { params, location, route }) {
  const keyPath = params.splat;
  (async function() {
    return {
      ruleDef: {
        type: path.extname(keyPath).substring(1),
        source: (await repo.getRule(keyPath)).toString(),
      }, meta:{
        
      }
    };}()).then(res.json.bind(res), console.error.bind(console));
}
