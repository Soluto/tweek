import { UKNOWN_AUTHOR } from '../unknownAuthor';
import {getPathForMeta, getPathForJPad} from "../../server/repositories/tweekPathsUtils";

export default async function (req, res,
  { gitTransactionManager, author = UKNOWN_AUTHOR },
  { params })
{
  const keyPath = params.splat;

  await gitTransactionManager.transact(async gitRepo => {
    await gitRepo.pull();

    await gitRepo.updateFile(getPathForMeta(keyPath), JSON.stringify(req.body.meta, null, 4));
    await gitRepo.updateFile(getPathForJPad(keyPath), req.body.keyDef.source);

    await gitRepo.commitAndPush("BackOffice - updating " + keyPath, author)
  });

  res.send('OK');
}
