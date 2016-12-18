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

    return {
      keyDef: {
        type: path.extname(keyPath).substring(1),
        source: await gitRepo.readFile(pathForJPad),
        modificationData: await gitRepo.getFileDetails(pathForJPad)
      },
      meta: JSON.parse(await gitRepo.readFile(pathForMeta))
    }
  });

  res.json(key);
}
