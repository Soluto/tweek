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
        const { dispatch, configKey } = this.props;
        if (configKey) {
          dispatch(getKey(configKey));
        }
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
                    <KeyRulesEditor ruleDef={selectedKey.ruleDef} sourceTree={JSON.parse(selectedKey.ruleDef.source)} onMutation={x => dispatch({ type: 'KEY_RULEDEF_UPDATED', payload: { source: JSON.stringify(x, null, 4) } })} />
                </div> :
                 <div>loading...</div>
                }</div>
            </div>

        );
      }
});
