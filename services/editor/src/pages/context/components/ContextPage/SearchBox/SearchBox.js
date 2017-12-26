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
      identityType: '',
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
    const identityType = selected ? selected.value : inputValue;
    this.setState({ inputValue, identityType });
  };

  onIdentityIdChange = (identityId) => {
    this.setState({ identityId });
  };

  onGetClick = () => {
    this.props.openContext({
      identityType: this.state.identityType,
      identityId: this.state.identityId,
    });
  };

  render() {
    const { inputValue, identityType, identities, identityId } = this.state;
    const identityText = identityType || 'identity';

    return (
      <div className="context-search-container" data-comp="search-identity">
        <div className="identity-type-container">
          <ComboBox
            data-field="identity-type"
            className="identity-type"
            placeholder="Enter Identity Type"
            value={inputValue}
            suggestions={identities}
            onChange={this.onIdentityChange}
          />
        </div>

        <div className="identity-id-container">
          <Input
            data-field="identity-id"
            placeholder={`Enter ${changeCase.pascalCase(identityText)} Id`}
            onEnterKeyPress={this.onGetClick}
            onChange={this.onIdentityIdChange}
            value={this.state.identityId}
          />
        </div>

        <div className="search-button-container">
          <button
            data-comp="search"
            className="search-button"
            onClick={this.onGetClick}
            disabled={!identityType || !identityId}
          />
        </div>
      </div>
    );
  }
}

export default connect(() => ({}), { openContext })(SearchBox);
