import React, { Component } from 'react';
import * as R from 'ramda';
import { createTweekContext } from 'react-tweek';
import { TweekRepository } from 'tweek-local-cache';
import { tweekClient } from '../utils/tweekClients';
import { withCurrentUser } from './CurrentUser';

export const TweekContext = createTweekContext();

TweekContext.prepare('@tweek/editor/_');

export const withTweekRepository = BaseComponent => props => (
  <TweekContext.Consumer>
    {tweekRepo => <BaseComponent {...props} tweekRepository={tweekRepo} />}
  </TweekContext.Consumer>
);

export const withTweekKeys = TweekContext.withTweekKeys;

const toTweekContext = ({ User }) => ({ tweek_editor_user: User });

class Provider extends Component {
  static displayName = 'TweekProvider';
  state = {
    tweekRepository: undefined,
  };

  componentDidMount() {
    this._setRepository(this.props.currentUser);
  }

  componentDidUpdate(prevProps) {
    const { currentUser } = this.props;
    if (!currentUser || R.equals(currentUser, prevProps.currentUser)) {
      return;
    }

    const { tweekRepository } = this.state;
    if (tweekRepository) {
      tweekRepository.updateContext(toTweekContext(currentUser));
    } else {
      this._setRepository(currentUser);
    }
  }

  _setRepository(currentUser) {
    if (!currentUser) {
      return;
    }

    const tweekRepository = new TweekRepository({
      client: tweekClient,
      context: toTweekContext(currentUser),
    });
    this.setState({ tweekRepository });
  }

  render() {
    const { tweekRepository } = this.state;
    const { children } = this.props;
    if (!tweekRepository) {
      return children;
    }

    return (
      <TweekContext.Provider value={this.state.tweekRepository}>{children}</TweekContext.Provider>
    );
  }
}

export const TweekProvider = withCurrentUser(Provider);
