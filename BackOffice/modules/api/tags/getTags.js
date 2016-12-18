import {getPathForTags} from "../../server/repositories/gitPathsUtils";
export default async function (req, res, { gitTransactionManager }) {

  const tagsJson = await gitTransactionManager.transact(async gitRepo => {
    await gitRepo.pull();

    return JSON.parse(await gitRepo.readFile(getPathForTags()));
  });


  res.json(tagsJson);
}
