import React from 'react';
import {ServerRoute} from 'react-project';
import * as KeysRoutes from './api/keys';
import * as TypesRoutes from './api/types';
import * as TagsRoutes from './api/tags';
import * as ContextSchemaRoutes from "./api/context";
import requestErrorHandlingWrapper from './utils/request-error-handling-wrapper';

export default ({tagsRepository, keysRepository, typesRepository, tweekApiHostname}) => (
  <ServerRoute path="/api">
    <ServerRoute path="tags"
                 get={requestErrorHandlingWrapper(TagsRoutes.getTags)}
                 put={requestErrorHandlingWrapper(TagsRoutes.saveTags)}
                 tagsRepository={tagsRepository}
    />
    <ServerRoute path="types"
                 get={requestErrorHandlingWrapper(TypesRoutes.getTypes)}
                 tweekApiHostname={tweekApiHostname}
    />
    <ServerRoute path="context-schema"
                 get={requestErrorHandlingWrapper(ContextSchemaRoutes.getContextSchema)}
                 tweekApiHostname={tweekApiHostname}
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
