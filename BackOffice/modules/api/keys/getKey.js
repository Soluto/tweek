import path from 'path';

export default function (req, res, { keysRepository, metaRepository }, { params }) {
  const keyPath = params.splat;
  
  (async function () {
    const keyData = await keysRepository.getKey(keyPath);

    return {
      keyDef: {
        type: path.extname(keyPath).substring(1),
        source: keyData.fileContent,
        modificationData: keyData.fileModificationData,
      },
      meta: await metaRepository.getKeyMeta(keyPath),
    };
  }()).then((x) => res.json(x), console.error.bind(console));
}
