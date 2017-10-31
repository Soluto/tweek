import { Observable } from 'rxjs';
import nconf from 'nconf';
import authenticatedClient from '../auth/authenticatedClient';

export default {
  onUpdate(authoringApiHostname) {
    const getRevision$ = Observable.defer(async () => {
      const client = await authenticatedClient({ baseURL: authoringApiHostname });
      const result = await client.get('/api/revision');
      return result.data;
    });

    const delay = nconf.get('CONTINUOUS_UPDATER_INTERVAL') || 5000;

    return Observable.concat(getRevision$, Observable.empty().delay(delay))
      .do(() => {}, err => console.error('Error checking revision:', err.message))
      .catch(_ => Observable.empty().delay(delay))
      .repeat()
      .distinctUntilChanged();
  },
};
