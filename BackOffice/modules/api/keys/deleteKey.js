import { UKNOWN_AUTHOR } from '../unknownAuthor';
import {getPathForMeta, getPathForJPad} from "../../server/repositories/gitPathsUtils";

export default async function (req, res,
  { gitTransactionManager, author = UKNOWN_AUTHOR },
  { params })
{
  const keyPath = params.splat;

  await gitTransactionManager.transact(async gitRepo => {
    await gitRepo.pull();

    await gitRepo.deleteFile(getPathForMeta(keyPath));
    await gitRepo.deleteFile(getPathForJPad(keyPath));

    await gitRepo.commitAndPush("BackOffice - deleting " + keyPath, author)
  });
  res.send('OK');
}
