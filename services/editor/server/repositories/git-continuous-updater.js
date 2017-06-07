import Rx from 'rxjs';

export default {
  onUpdate: gitTransactionManager =>
    Rx.Observable
      .defer(async () => {
        await gitTransactionManager.read(async gitRepo => await gitRepo.fetch());
        return await gitTransactionManager.write(async gitRepo => await gitRepo.mergeMaster());
      })
      .do((_) => {}, err => console.error('Error pulling changes in git repo', err))
      .delay(5000)
      .retry()
      .repeat()
      .distinctUntilChanged(),
};
