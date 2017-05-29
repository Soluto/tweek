import React, { Component } from 'react';
import { connect } from 'react-redux';
import changeCase from 'change-case';
import { getIdentities } from '../../../../../services/context-service';
import { openContext } from '../../../../../store/ducks/context';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import style from './SearchBox.css';

class SearchBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      identityName: '',
      identityId: '',
      identities: [],
    };
  }

  componentWillMount() {
    const identities = getIdentities().map(x => ({ label: changeCase.pascalCase(x), value: x }));
    this.setState({ identities });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  onIdentityChange(input, selected) {
    const identityName = selected ? selected.value : input;
    this.setState({ identityName });
  }

  onIdentityIdChange(identityId) {
    this.setState({ identityId });
  }

  onGetClick() {
    this.props.openContext({
      identityName: this.state.identityName,
      identityId: this.state.identityId,
    });
  }

  render() {
    const { identityName, identities, identityId } = this.state;
    const identityText = identityName || 'identity';

    return (
      <div className={style['context-search-container']}>

        <div className={style['context-type-container']}>
          <ComboBox
            className={style['context-type']}
            placeholder="Enter Identity Type"
            value={identities.find(x => x.value === identityName)}
            suggestions={identities}
            onChange={this.onIdentityChange.bind(this)}
          />
        </div>

        <div className={style['context-id-container']}>
          <Input
            placeholder={`Enter ${changeCase.pascalCase(identityText)} Id`}
            onEnterKeyPress={() => this.onGetClick()}
            onChange={value => this.onIdentityIdChange(value)}
            value={this.state.identityId}
          />
        </div>

        <div className={style['search-button-container']}>
          <button className={style['search-button']} onClick={this.onGetClick.bind(this)} disabled={!identityName || !identityId} />
        </div>
      </div>
    );
  }
}

export default connect(state => state, { openContext })(SearchBox);
