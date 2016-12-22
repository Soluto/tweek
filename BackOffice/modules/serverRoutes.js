import React from 'react';
import { ServerRoute } from 'react-project';
import * as KeysRoutes from './api/keys';
import * as TagsRoutes from './api/tags';
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default ({ tagsRepository, keysRepository }) => (
  <ServerRoute path="/api">
    <ServerRoute path="tags"
                 get={requestErrorHandlingWrapper(TagsRoutes.getTags)}
                 put={requestErrorHandlingWrapper(TagsRoutes.saveTags)}
                 tagsRepository={tagsRepository}
    />
    <ServerRoute path="keys">
      <ServerRoute path="*"
                   get={requestErrorHandlingWrapper(KeysRoutes.getKey)}
                   put={requestErrorHandlingWrapper(KeysRoutes.saveKey)}
                   delete={requestErrorHandlingWrapper(KeysRoutes.deleteKey)}
                   keysRepository={keysRepository}
      />
    </ServerRoute>
  </ServerRoute>)
;
