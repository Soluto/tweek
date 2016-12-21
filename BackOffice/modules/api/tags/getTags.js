import {getPathForTags} from "../../server/repositories/tweekPathsUtils";
export default async function (req, res, { gitTransactionManager }) {

  try {
    const tagsJson = await gitTransactionManager.transact(async gitRepo => {
      return JSON.parse(await gitRepo.readFile(getPathForTags()));
    });

    res.json(tagsJson);
  }
  catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
