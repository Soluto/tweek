import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { AuthProvider } from 'tweek-client';
import Loader from '../../../components/Loader';
import logoSrc from '../../../components/resources/logo.svg';
import { basicAuthProvider, signIn } from '../../../services/auth-service';
import { RedirectState } from '../../../services/auth/clients/base-auth-client';
import { showError, tweekManagementClient } from '../../../utils';

const MainComponent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;

  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
`;

const LeftPane = styled.div`
  flex: 35;
  background-color: #00aeef;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RightPane = styled.div`
  flex: 65;
  background-color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WelcomeMessageSpan = styled.span`
  font-family: Roboto;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-top: 250px;
  margin-bottom: 90px;
`;

const TweekLogo = styled.img`
  width: 65%;
`;

const LoginMessageSpan = styled.span`
  ֿ: Roboto;
  font-size: 20px;
  font-weight: bold;
  color: #696969;
  margin-bottom: 20px;
  margin-top: 250px;
`;

const LoginButton = styled.div`
  padding-top: 14px;
  padding-bottom: 17px;
  margin: 15px;
  width: 40%;
  background-color: #00aeef;
  border-radius: 25px;
  cursor: pointer;

  color: #ffffff;
  font-family: Roboto;
  font-size: 14.4px;
  font-weight: bold;

  text-align: center;
  text-decoration: none;
`;

type Provider = {
  id: string;
  name: string;
  action: (state: RedirectState) => void;
};

const LoginPage = ({ location: { state = '/' } }: RouteComponentProps) => {
  const [authProviders, setAuthProviders] = useState<Provider[]>();

  useEffect(() => {
    const run = async () => {
      const res = await tweekManagementClient.getAuthProviders();
      const combinedProviders: Record<string, AuthProvider> = {
        ...(res as any),
        '@@tweek-basic-auth': basicAuthProvider,
      };

      const providers = Object.keys(combinedProviders)
        .filter((key) => combinedProviders[key].login_info?.login_type)
        .map(
          (key): Provider => ({
            id: key,
            name: combinedProviders[key].name,
            action: (state) => signIn(combinedProviders[key], state),
          }),
        );

      setAuthProviders(providers);
    };

    run().catch((err) => showError(err, 'Something went wrong'));
  }, []);
  return (
    <MainComponent>
      <LeftPane>
        <WelcomeMessageSpan>Welcome to:</WelcomeMessageSpan>
        <TweekLogo data-comp="tweek-logo" src={logoSrc} />
      </LeftPane>
      <RightPane>
        <LoginMessageSpan>Log into Tweek using:</LoginMessageSpan>
        {authProviders ? (
          authProviders.map((ap) => (
            <LoginButton
              key={ap.id}
              onClick={() => ap.action(state as RedirectState)}
              data-comp={ap.id}
            >
              {ap.name}
            </LoginButton>
          ))
        ) : (
          <Loader />
        )}
      </RightPane>
    </MainComponent>
  );
};

export default LoginPage;
