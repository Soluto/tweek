import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Services } from 'tweek-client';
import { version } from '../../../../../package.json';
import Loader from '../../../../components/Loader';
import { tweekManagementClient } from '../../../../utils';

const ServiceStatus = styled.span<{ status: string }>`
  height: 10px;
  width: 10px;
  background-color: ${({ status }) => (status === 'healthy' ? 'lime' : 'red')};
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`;

const ServiceVersion = styled.span``;

const Versions = () => {
  const [services, setServices] = useState<Services>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    tweekManagementClient.getServiceDetails().then(setServices).catch(setError);
  }, []);

  return (
    <div style={{ backgroundColor: '#333b41', color: 'white', padding: 10 }}>
      <div style={{ textTransform: 'uppercase', marginBottom: 8 }}>version</div>
      {error ? (
        'failed to retrieve version'
      ) : services ? (
        <ul>
          {Object.entries(services).map(([name, { version, status }]) => (
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
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default Versions;
