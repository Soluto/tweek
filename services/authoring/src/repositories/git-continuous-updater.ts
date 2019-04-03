import { Observable } from 'rxjs';
import logger from '../utils/logger';
const { CONTINUOUS_UPDATER_INTERVAL } = require('../constants');

export default {
  onUpdate(gitTransactionManager) {
    const updateRepo$ = Observable.defer(async () => {
      await gitTransactionManager.read(async (gitRepo) => await gitRepo.fetch());
      return await gitTransactionManager.write(async (gitRepo) => await gitRepo.mergeMaster());
    });

    return updateRepo$
      .do(null, (err) => logger.error({ err }, 'Error pulling changes in git repo'))
      .catch((_) => Observable.empty())
      .concat(Observable.empty().delay(CONTINUOUS_UPDATER_INTERVAL))
      .repeat()
      .distinctUntilChanged()
      .do((sha) => logger.info({ sha }, 'Updated git repo'));
  },
};
