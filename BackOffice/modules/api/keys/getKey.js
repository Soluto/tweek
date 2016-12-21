import path from 'path';
import {getPathForJPad, getPathForMeta} from "../../server/repositories/gitPathsUtils";

export default async function (req, res,
  { gitTransactionManager },
  { params })
{
  const keyPath = params.splat;

  const key = await gitTransactionManager.transact(async gitRepo => {
    await gitRepo.pull();

    let pathForJPad = getPathForJPad(keyPath);
    let pathForMeta = getPathForMeta(keyPath);

    try {
      let ruleHistory = await gitRepo.getFileDetails(pathForJPad);
      let jpadSource = await gitRepo.readFile(pathForJPad);
      let metaSource = await gitRepo.readFile(pathForMeta);

      return {
        keyDef: {
          type: path.extname(keyPath).substring(1),
          source: jpadSource,
          modificationData: ruleHistory
        },
        meta: JSON.parse(metaSource)
      }
    }
    catch (err) {
      console.warn(`Could not get key ${keyPath}: ${err}`);
      return null;
    }
  });

  if (key == null) {
    res.status(404).send(null);
  }

  res.json(key);
}
