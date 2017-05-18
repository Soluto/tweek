import React from 'react';
import ServerRoute from './server/ServerRoute';
import * as KeysRoutes from './api/keys';
import * as TypesRoutes from './api/types';
import * as TagsRoutes from './api/tags';
import * as ContextRoutes from './api/context';
import * as SearchRoutes from './api/search';
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default ({ tagsRepository, keysRepository, tweekApiHostname }) => (
  <ServerRoute path="/api">
    <ServerRoute
      path="tags"
      get={requestErrorHandlingWrapper(TagsRoutes.getTags)}
      put={requestErrorHandlingWrapper(TagsRoutes.saveTags)}
      tagsRepository={tagsRepository}
    />
    <ServerRoute
      path="types"
      get={requestErrorHandlingWrapper(TypesRoutes.getTypes)}
      tweekApiHostname={tweekApiHostname}
    />
    <ServerRoute
      path="context-schema"
      get={requestErrorHandlingWrapper(ContextRoutes.getContextSchema)}
      tweekApiHostname={tweekApiHostname}
    />
    <ServerRoute path="context">
      <ServerRoute
        path=":identityName/:identityId"
        get={requestErrorHandlingWrapper(ContextRoutes.getContext)}
        post={requestErrorHandlingWrapper(ContextRoutes.updateContext)}
        tweekApiHostname={tweekApiHostname}
      />
    </ServerRoute>
    <ServerRoute path="keys">
      <ServerRoute
        path="*"
        get={requestErrorHandlingWrapper(KeysRoutes.getKey)}
        put={requestErrorHandlingWrapper(KeysRoutes.saveKey)}
        delete={requestErrorHandlingWrapper(KeysRoutes.deleteKey)}
        keysRepository={keysRepository}
      />
    </ServerRoute>
    <ServerRoute path="meta">
      <ServerRoute
        path="*"
        keysRepository={keysRepository}
        get={requestErrorHandlingWrapper(KeysRoutes.getKeyMeta)} />
    </ServerRoute>
    <ServerRoute
      path="search-index"
      get={requestErrorHandlingWrapper(SearchRoutes.getSearchIndex)}
    />
  </ServerRoute>)
  ;
