import React, { Component } from 'react';
import { tweekManagementClient } from '../utils/tweekClients';

export const CurrentUserContext = React.createContext(null);

export class CurrentUserProvider extends Component {
  state = {
    currentUser: null,
  };
  _isMounted = false;

  async componentDidMount() {
    this._isMounted = true;
    const currentUser = await tweekManagementClient.currentUser();
    if (!this._isMounted) {
      return;
    }
    this.setState({ currentUser });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <CurrentUserContext.Provider value={this.state.currentUser}>
        {this.props.children}
      </CurrentUserContext.Provider>
    );
  }
}

export const withCurrentUser = BaseComponent => props => (
  <CurrentUserContext.Consumer>
    {currentUser => <BaseComponent {...props} currentUser={currentUser} />}
  </CurrentUserContext.Consumer>
);
