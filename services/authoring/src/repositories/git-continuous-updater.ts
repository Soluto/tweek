import { Observable } from 'rxjs';
const { CONTINUOUS_UPDATER_INTERVAL } = require('../constants');

export default {
  onUpdate(gitTransactionManager) {
    const updateRepo$ = Observable.defer(async () => {
      await gitTransactionManager.read(async gitRepo => await gitRepo.fetch());
      return await gitTransactionManager.write(async gitRepo => await gitRepo.mergeMaster());
    });

    return updateRepo$
      .concat(updateRepo$.delay(CONTINUOUS_UPDATER_INTERVAL).repeat())
      .do((_) => {}, err => console.error('Error pulling changes in git repo', err))
      .retryWhen(o => o.mergeMapTo(Observable.of(1).delay(CONTINUOUS_UPDATER_INTERVAL)))
      .distinctUntilChanged()
      .do(sha => console.log('Updated git repo', sha))
      .share();
  },
};
