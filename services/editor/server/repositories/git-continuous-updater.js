import Rx from 'rxjs';
import nconf from 'nconf';

export default {
  onUpdate: gitTransactionManager =>
    Rx.Observable
      .defer(async () => {
        await gitTransactionManager.read(async gitRepo => await gitRepo.fetch());
        return await gitTransactionManager.write(async gitRepo => await gitRepo.mergeMaster());
      })
      .do((_) => {}, err => console.error('Error pulling changes in git repo', err))
      .delay(nconf.get('CONTINUOUS_UPDATER_INTERVAL') || 5000)
      .retry()
      .repeat()
      .distinctUntilChanged(),
};
