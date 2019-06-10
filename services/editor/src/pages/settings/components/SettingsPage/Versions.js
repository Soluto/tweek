import React from 'react';
import { mapPropsStream } from 'recompose';
import { Observable } from 'rxjs';
import * as R from 'ramda';
import styled from '@emotion/styled';
import { version } from '../../../../../package.json';
import { tweekManagementClient } from '../../../../utils/tweekClients';

const ServiceStatus = styled.span`
  height: 10px;
  width: 10px;
  background-color: ${({ status }) => (status === 'healthy' ? 'lime' : 'red')};
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`;

const ServiceVersion = styled.span``;

const Versions = mapPropsStream((prop$) =>
  Observable.defer(() => tweekManagementClient.getServiceDetails())
    .map((services) => ({ services }))
    .catch((ex) => Observable.of({ error: ex })),
)(({ services, error }) => (
  <div style={{ backgroundColor: '#333b41', color: 'white', padding: 10 }}>
    <div style={{ textTransform: 'uppercase', marginBottom: 8 }}>version</div>
    {error ? (
      'failed to retrieve version'
    ) : (
      <ul>
        {R.toPairs(services).map(([name, { version, status }]) => (
          <li key={name}>
            <ServiceStatus status={status} />
            <ServiceVersion>
              {name}: {version}
            </ServiceVersion>
          </li>
        ))}
        <li key="editor">
          <ServiceStatus status={'healthy'} />
          <ServiceVersion>{`editor: ${version}`}</ServiceVersion>
        </li>
      </ul>
    )}
  </div>
));

export default Versions;
