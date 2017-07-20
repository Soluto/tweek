const Rx = require('rxjs');
const { CONTINUOUS_UPDATER_INTERVAL } = require('../constants');

module.exports = {
  onUpdate: gitTransactionManager =>
    Rx.Observable
      .defer(async () => {
        await gitTransactionManager.read(async gitRepo => await gitRepo.fetch());
        return await gitTransactionManager.write(async gitRepo => await gitRepo.mergeMaster());
      })
      .do((_) => {}, err => console.error('Error pulling changes in git repo', err))
      .delay(CONTINUOUS_UPDATER_INTERVAL)
      .retry()
      .repeat()
      .distinctUntilChanged()
      .do(sha => console.log('Updated git repo', sha)),
};
