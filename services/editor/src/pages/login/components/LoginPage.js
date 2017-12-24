import React from 'react';
import { compose, withState, lifecycle } from 'recompose';
import styled from 'react-emotion';

import { getAuthProviders } from '../../../services/auth-service';
import logoSrc from '../../../components/resources/logo.svg';

const MainComponent = styled('div')`
  display: flex;
  flex-direction: row;
  flex: 1;

  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
`;

const LeftPane = styled('div')`
  flex: 35;
  background-color: #00aeef;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RightPane = styled('div')`
  flex: 65;
  background-color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WelcomeMessageSpan = styled('span')`
  font-family: Roboto;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-top: 250px;
  margin-bottom: 90px;
`;

const TweekLogo = styled('img')`
  width: 65%;
`;

const LoginMessageSpan = styled('span')`
  ֿ: Roboto;
  font-size: 20px;
  font-weight: bold;
  color: #696969;
  margin-bottom: 20px;
  margin-top: 250px;
`;

const LoginButton = styled('a')`
  padding-top: 14px;
  padding-bottom: 17px;
  margin: 15px;
  width: 40%;
  background-color: #00aeef;
  border-radius: 25px;

  color: #ffffff;
  font-family: Roboto;
  font-size: 14.4px;
  font-weight: bold;

  text-align: center;
  text-decoration: none;
`;

const LoginPage = ({ authProviders }) => (
  <MainComponent>
    <LeftPane>
      <WelcomeMessageSpan>Welcome to:</WelcomeMessageSpan>
      <TweekLogo data-comp="tweek-logo" src={logoSrc} />
    </LeftPane>
    <RightPane>
      <LoginMessageSpan>Login into Tweek using:</LoginMessageSpan>
      {authProviders.map(ap => (
        <LoginButton key={ap.name} href={ap.url} data-comp={ap.name}>
          {ap.name}
        </LoginButton>
      ))}
    </RightPane>
  </MainComponent>
);

const enhancer = compose(
  withState('authProviders', 'setAuthProviders', []),
  lifecycle({
    componentWillMount() {
      getAuthProviders().then(res => this.props.setAuthProviders(res));
    },
  }),
);

export default enhancer(LoginPage);
