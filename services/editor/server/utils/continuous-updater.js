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

    return getRevision$.concat(getRevision$.delay(delay).repeat())
      .retryWhen(Observable.of(1).delay(delay))
      .distinctUntilChanged();
  },
};
