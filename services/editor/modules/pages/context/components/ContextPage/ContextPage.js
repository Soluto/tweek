import React, { Component } from 'react';
import SearchBox from './SearchBox/SearchBox';

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

  render() {
    return (
      <div >
        <SearchBox onGetContext={this.onGetContext.bind(this)} />
        <div style={{ marginTop: '20px' }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ContextPage;
