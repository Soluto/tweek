import React from 'react';
import { ServerRoute, IndexRoute } from 'react-project';
import getKey from './api/keys/getKey';
import putKey from './api/keys/putKey';
import getTags from './api/tags/getTags';

export default ({ rulesRepository, metaRepository, tagsRepository }) => (
  <ServerRoute path="/api">
    <ServerRoute get={getTags}
      tagsRepository={tagsRepository} path="tags"
    />
    <ServerRoute path="keys">
      <ServerRoute path="*"
        get={getKey}
        rulesRepository={rulesRepository}
        metaRepository={metaRepository}
        tagsRepository={tagsRepository}
        put={putKey}
      />
    </ServerRoute>
  </ServerRoute>)
  ;
