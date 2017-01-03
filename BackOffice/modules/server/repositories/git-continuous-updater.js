import Promise from 'bluebird';

export default {
  start: async function (gitTransactionManager){

    while (true){

      try {
        await gitTransactionManager.read(async gitRepo => await gitRepo.fetch());
        await gitTransactionManager.write(async gitRepo => await gitRepo.mergeMaster());
      }
      catch (err){
        console.error("Error pulling changes in git repo ", err)
      }

      await Promise.delay(5000);
    }
  }
}