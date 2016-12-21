import path from 'path';
import {getPathForJPad, getPathForMeta} from "../../server/repositories/tweekPathsUtils";

export default async function (req, res,
  { gitTransactionManager },
  { params })
{
  const keyPath = params.splat;
  try {

    const key = await gitTransactionManager.transact(async gitRepo => {
      let pathForJPad = getPathForJPad(keyPath);
      let pathForMeta = getPathForMeta(keyPath);

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
    });
    res.json(key);

  }
  catch (err) {
    if (err.message.includes("no such file or directory")) {
      res.sendStatus(404);
    }
    else {
      console.error(err);
      res.sendStatus(500);
    }
  }
}
