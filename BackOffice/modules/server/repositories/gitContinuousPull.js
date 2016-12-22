import Promise from 'bluebird';


export default async function (gitTransactionManager){

  while (true){

    try {
      await gitTransactionManager.transact(async gitRepo => await gitRepo.pull());
    }
    catch (err){
      console.error("Error pulling changes in git repo ", err)
    }

    await Promise.delay(5000);
  }
}