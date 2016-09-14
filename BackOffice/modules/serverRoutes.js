import React from 'react';
import { ServerRoute } from 'react-project';
import getKey from './api/keys/getKey';
import putKey from './api/keys/putKey';
import deleteKey from './api/keys/deleteKey';
import getTags from './api/tags/getTags';
import putTags from './api/tags/putTags';

export default ({ keysRepository, metaRepository, tagsRepository }) => (
  <ServerRoute path="/api">
    <ServerRoute path="tags"
      get={getTags}
      put={putTags}
      tagsRepository={tagsRepository}
      />
    <ServerRoute path="keys">
      <ServerRoute path="*"
        get={getKey}
        put={putKey}
        delete={deleteKey}
        keysRepository={keysRepository}
        metaRepository={metaRepository}
        />
    </ServerRoute>
  </ServerRoute>)
  ;
