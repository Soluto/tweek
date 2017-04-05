import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import FixedConfiguration from './FixedConfiguration';

export default compose(
  connect(state => state),

)
(class ContextPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {

    return (
      <div >
            Hello world
      </div>
    );
  }
});
