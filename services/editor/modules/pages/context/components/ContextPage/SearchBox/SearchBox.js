import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import changeCase from 'change-case';
import { refreshSchema, getIdentities } from '../../../../../services/context-service';
import withLoading from '../../../../../hoc/with-loading';
import { openContext } from '../../../../../store/ducks/context';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import style from './SearchBox.css';

class SearchBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contextType: '',
      contextId: '',
      identities: [],
    };
  }

  componentWillMount() {
    const identities = getIdentities().map(x => ({ label: changeCase.pascalCase(x), value: x }));
    const contextType = identities[0];

    this.setState({ identities, contextType });
  }

  onContextTypeChange({ value: contextType }) {
    this.setState({ contextType });
  }

  onContextIdChange(contextId) {
    this.setState({ contextId });
  }

  onGetClick() {
    this.props.openContext({
      contextType: this.state.contextType,
      contextId: this.state.contextId,
    });
  }

  render() {
    const { contextType, identities, contextId } = this.state;

    return (
      <div className={style['context-search-container']}>

        <div className={style['context-type-container']}>
          <ComboBox
            placeholder="Context Type"
            options={identities}
            onChange={this.onContextTypeChange.bind(this)}
            selected={identities.filter(x => x.value === contextType)}
          />
        </div>

        <div className={style['context-id-container']}>
          <Input
            placeholder="Context Id"
            onEnterKeyPress={() => this.onGetClick()}
            onChange={e => this.onContextIdChange(e.target.value)}
          />
        </div>

        <div className={style['search-button-container']}>
          <button className={style['search-button']} onClick={this.onGetClick.bind(this)} disabled={!contextType || !contextId} />
        </div>
      </div>
    );
  }
}

SearchBox.propTypes = {
  openContext: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state, { openContext }),
  withLoading(() => null, refreshSchema()),
)(SearchBox);
