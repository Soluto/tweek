import React from 'react';
import { mapPropsStream } from 'recompose';
import { Observable } from 'rxjs';
import * as R from 'ramda';
import fetch from '../../../../utils/fetch';

const Versions = mapPropsStream(prop$ =>
  Observable.defer(() => fetch('/api/system/service-version').then(x => x.json()))
    .map(services => ({ services }))
    .catch(ex => Observable.of({ error: ex })),
)(({ services, error }) => (
  <div style={{ backgroundColor: '#333b41', color: 'white', padding: 10 }}>
    <div style={{ textTransform: 'uppercase', marginBottom: 8 }}>version</div>
    {error ? (
      'failed to retrieve version'
    ) : (
      <ul>
        {R.toPairs(services).map(([name, version]) => (
          <li>
            {name}: {version}
          </li>
        ))}
      </ul>
    )}
  </div>
));

export default Versions;
