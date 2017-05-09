import React, { Component } from 'react';
import SearchBox from './SearchBox/SearchBox';
import FixedConfiguration from './FixedKeys/FixedKeys';

class ContextPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contextType: '',
      contextId: '',
    };
  }

  onGetContext(context) {
    this.setState({ ...context });
  }

  shouldRender() {
    return this.state.contextType && this.state.contextId;
  }

  render() {
    return (
      <div >
        <SearchBox onGetContext={this.onGetContext.bind(this)} />
        {
          !this.shouldRender()
            ? null
            : <div style={{ marginTop: '20px' }}>
              <FixedConfiguration
                contextType={this.state.contextType}
                contextId={this.state.contextId}
              />
            </div>
        }
      </div>
    );
  }
}

export default ContextPage;
