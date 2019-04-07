import { concat, defer, EMPTY } from 'rxjs';
import { catchError, delay, distinctUntilChanged, repeat, tap } from 'rxjs/operators';
import logger from '../utils/logger';
const { CONTINUOUS_UPDATER_INTERVAL } = require('../constants');

export default {
  onUpdate(gitTransactionManager) {
    const updateRepo$ = defer(async () => {
      await gitTransactionManager.read(async (gitRepo) => await gitRepo.fetch());
      return await gitTransactionManager.write(async (gitRepo) => await gitRepo.mergeMaster());
    }).pipe(
      catchError((err) => {
        logger.error({ err }, 'Error pulling changes in git repo');
        return EMPTY;
      }),
    );

    const delayComplete$ = EMPTY.pipe(delay(CONTINUOUS_UPDATER_INTERVAL));

    return concat(updateRepo$, delayComplete$).pipe(
      repeat(),
      distinctUntilChanged(),
      tap((sha) => logger.info({ sha }, 'Updated git repo')),
    );
  },
};
