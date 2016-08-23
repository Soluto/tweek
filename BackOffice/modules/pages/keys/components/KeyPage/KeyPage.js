import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import KeyRulesEditor from '../KeyRulesEditor/KeyRulesEditor';
import * as keysActions from '../../ducks/selectedKey';
import { deleteKey } from '../../ducks/keys';
import style from './KeyPage.css';
import { diff } from 'deep-diff';
import R from 'ramda';
import TextareaAutosize from 'react-autosize-textarea';
import KeyTags from './KeyTags/KeyTags';
import EditableText from './EditableText/EditableText';
import KeyModificationDetails from './KeyModificationDetails/KeyModificationDetails';
import Autosuggest from 'react-autosuggest';

const getKeyPrefix = (path) => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

export default connect((state, { params, route }) => (
  { keysList: state.keys, selectedKey: state.selectedKey, configKey: route.isInAddMode ? '_blank' : params.splat, isInAddMode: route.isInAddMode }),
  { ...keysActions, deleteKey })(
  class KeyPage extends Component {

    static propTypes = {
      dispatch: React.PropTypes.func,
      configKey: React.PropTypes.string,
      selectedKey: React.PropTypes.object,
    }

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      const { openKey, configKey, selectedKey, isInAddMode } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey);
    }

    componentWillReceiveProps({ configKey }) {
      const { openKey, selectedKey, isInAddMode } = this.props;
      if (configKey !== this.props.configKey || !selectedKey) {
        openKey(configKey);
      }
    }

    _onKeyNameChanged(newKeyName) {
      this.props.updateKeyName(newKeyName);
    }

    _onDisplayNameChanged(newDisplayName) {
      const newMeta = { ...this.props.selectedKey.local.meta, displayName: newDisplayName };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    _onDescriptionChanged(newDescription) {
  const newMeta = { ...this.props.selectedKey.local.meta, description: newDescription };
  this._onSelectedKeyMetaChanged(newMeta);
}

    _onSelectedKeyMetaChanged(newMeta) {
  this.props.updateKeyMetaDef(newMeta);
}

    _onTagAdded(newTagText) {
  const meta = this.props.selectedKey.local.meta;
  const newMeta = { ...meta, tags: [...meta.tags, newTagText] };
  this._onSelectedKeyMetaChanged(newMeta);
}

    _onTagDeleted(deletedTagIndex) {
  const meta = this.props.selectedKey.local.meta;
  const newMeta = { ...meta, tags: R.remove(deletedTagIndex, 1, meta.tags) };
  this._onSelectedKeyMetaChanged(newMeta);
}

    _keyNameSuggestions() {
  return getSugesstions(this.props.keysList).sort();
}

    renderKeyActionButtons(isInAddMode) {
  const { local, remote, isSaving, isDeleting } = this.props.selectedKey;
  const changes = diff(local, remote);
  const hasChanges = (changes || []).length > 0;
  return (
    <div className={style['key-action-buttons-wrapper']}>
      {!isInAddMode ?
        <button disabled={isSaving}
          className={style['delete-key-button']}
          onClick={() => {
            if (confirm('Are you sure?')) {
              this.props.deleteKey(this.props.configKey);
            }
          } }
        >
          Delete key
        </button> : null}
      <button disabled={!hasChanges || isSaving }
        data-state-has-changes={hasChanges}
        data-state-is-saving={isSaving}
        className={style['save-changes-button']}
        onClick={() => this.props.saveKey(this.props.configKey) }
      >
        {isSaving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
}

    render() {
  const { configKey, selectedKey, isInAddMode } = this.props;
  if (!selectedKey) return <div className={style['loading-message']}>loading</div>;
  const { meta, ruleDef, key = '' } = selectedKey.local;

  const inputProps = {
    placeholder: 'Enter key full path',
    value: key,
    onChange: (_, { newValue }) => this._onKeyNameChanged(newValue),
  };

  return (
    <div className={style['key-viewer-container']}>
      {this.renderKeyActionButtons(isInAddMode) }
      <div className={style['key-header']}>

        {ruleDef.modificationData ?
          <KeyModificationDetails className={style['modification-data']} {...ruleDef.modificationData} />
          : null
        }

        <div className={style['display-name-wrapper']}>
          {isInAddMode ?
            <div className={style['auto-suggest-wrapper']}>
            <Autosuggest
              suggestions={ this._keyNameSuggestions() }
              getSuggestionValue={(x) => x}
              renderSuggestion={x => <span>{x}</span>}
              inputProps={inputProps}
              theme={style}
            />
              </div>
            :
            <EditableText onTextChanged={(text) => this:: this._onDisplayNameChanged(text) }
              placeHolder="Enter key display name"
              value={meta.displayName}
              classNames={{
            container: style['display-name-container'],
            input: style['display-name-input'],
            text: style['display-name-text'],
            form: style['display-name-form'],
          }}
            />
          }
        </div>

        {!isInAddMode ?
          <div className={style['key-full-path']}>
            <label>Full path: </label>
            <label className={style['actual-path']}>{configKey}</label>
          </div>
          : null}

        <div className={style['key-description-and-tags-wrapper']}>

          <div className={style['key-description-wrapper']}>
            <TextareaAutosize
              onChange={ (e) => this._onDescriptionChanged(e.target.value) }
              value = { meta.description }
              placeholder="Write key description"
              className={style['description-input']}
            />
          </div>

          <div className={style['tags-wrapper']}>

            <KeyTags onTagAdded={ this:: this._onTagAdded }
              onTagDeleted={ this:: this._onTagDeleted }
            />

          </div>

        </div>

      </div>

      <KeyRulesEditor ruleDef={ruleDef}
        sourceTree={JSON.parse(ruleDef.source) }
        onMutation={x => this.props.updateKeyRuleDef({ source: JSON.stringify(x, null, 4) }) }
        className={style['key-rules-editor']}
      />

    </div >
  );
} });
