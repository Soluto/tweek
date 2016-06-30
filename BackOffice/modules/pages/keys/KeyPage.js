import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import getKey from './actions/getKey';
import saveKey from './actions/saveKey';
import KeyMetaEditor from './components/KeyMetaEditor';
import KeyRulesEditor from './components/KeyRulesEditor';
import { KeyPage as KeyPageStyle } from './styles.css';

export default connect((state, { params }) => ({ ...state, configKey: params.splat }))(
    class KeyPage extends Component {

      static propTypes = { dispatch: React.PropTypes.func,
                         configKey: React.PropTypes.string,
                         selectedKey: React.PropTypes.object,
                        }

      constructor(props) {
        super(props);
      }

      componentDidMount() {
        this.props.dispatch(getKey(this.props.configKey));
      }

      componentWillReceiveProps({ configKey }) {
        if (configKey !== this.props.configKey || !this.props.selectedKey) {
          this.props.dispatch(getKey(configKey));
        }
      }

      render() {
        const { dispatch, configKey, selectedKey } = this.props;
        return (
            <div key={configKey} className={KeyPageStyle}>
            <h3>{configKey}</h3>
            <div>{selectedKey ?
                <div>
                    <KeyMetaEditor meta={selectedKey.meta} />
                    <button onClick={() => dispatch(saveKey(configKey))}>Save</button>
                    <KeyRulesEditor ruleDef={selectedKey.ruleDef} updateRule={x => dispatch({ type: 'KEY_RULEDEF_UPDATED', payload: x })} />
                </div> :
                 <div>loading...</div>
                }</div>
            </div>

        );
      }
});
