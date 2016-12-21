import { UKNOWN_AUTHOR } from '../unknownAuthor';
import { getPathForTags } from "../../server/repositories/tweekPathsUtils";
import { uniqBy } from "ramda";

export default async function (req, res,
  { gitTransactionManager, author = UKNOWN_AUTHOR })
{
  const tagsToSave = req.body;

  await gitTransactionManager.transact(async gitRepo => {
    await gitRepo.pull();

    const currentTags = JSON.parse(await gitRepo.readFile(getPathForTags()));
    const changedTags = tagsToSave.map(x => ({ name: x }));

    const newTags = uniqBy(x => x.name, [...currentTags, ...changedTags]);

    await gitRepo.updateFile(getPathForTags(), JSON.stringify(newTags));

    await gitRepo.commitAndPush("BackOffice - updating tags", author);
  });

  res.send('OK');
}
