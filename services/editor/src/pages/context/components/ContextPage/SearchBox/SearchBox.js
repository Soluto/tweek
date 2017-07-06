import React, { Component } from 'react';
import { connect } from 'react-redux';
import changeCase from 'change-case';
import { getIdentities } from '../../../../../services/context-service';
import { openContext } from '../../../../../store/ducks/context';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import './SearchBox.css';

class SearchBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      identityName: '',
      identityId: '',
      inputValue: '',
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

  onIdentityChange = (inputValue, selected) => {
    const identityName = selected ? selected.value : inputValue;
    this.setState({ inputValue, identityName });
  }

  onIdentityIdChange = (identityId) => {
    this.setState({ identityId });
  }

  onGetClick = () => {
    this.props.openContext({
      identityName: this.state.identityName,
      identityId: this.state.identityId,
    });
  }

  render() {
    const { inputValue, identityName, identities, identityId } = this.state;
    const identityText = identityName || 'identity';

    return (
      <div className={'context-search-container'}>

        <div className={'context-type-container'}>
          <ComboBox
            className={'context-type'}
            placeholder="Enter Identity Type"
            value={inputValue}
            suggestions={identities}
            onChange={this.onIdentityChange}
          />
        </div>

        <div className={'context-id-container'}>
          <Input
            placeholder={`Enter ${changeCase.pascalCase(identityText)} Id`}
            onEnterKeyPress={this.onGetClick}
            onChange={this.onIdentityIdChange}
            value={this.state.identityId}
          />
        </div>

        <div className={'search-button-container'}>
          <button
            className={'search-button'}
            onClick={this.onGetClick}
            disabled={!identityName || !identityId}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => state, { openContext })(SearchBox);
