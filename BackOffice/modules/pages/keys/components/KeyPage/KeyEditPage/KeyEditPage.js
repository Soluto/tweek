import React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import KeyRulesEditor from './KeyRulesEditor/KeyRulesEditor';
import style from './KeyEditPage.css';
import KeyTags from './KeyTags/KeyTags';
import EditableText from './EditableText/EditableText';
import EditableTextArea from './EditableTextArea/EditableTextArea';
import KeyModificationDetails from './KeyModificationDetails/KeyModificationDetails';
import { compose } from 'recompose';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import R from 'ramda';

export default class KeyEditPage extends Component {

  constructor(props) {
    super(props);
  }

  _onTagsChanged(newTags) {
    const newMeta = { ...this.props.selectedKey.local.meta, tags: newTags };
    this._onSelectedKeyMetaChanged(newMeta);
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

  render() {
    const { configKey, selectedKey, isInAddMode } = this.props;
    const { key, local: {meta, keyDef}} = selectedKey;
    const isReadonly = meta.readOnly;

    return (
      <form className={style['key-viewer-container-form']}>
        <fieldset className={style['key-viewer-container-fieldset']}
          disabled={isReadonly}>

          <div className={style['key-viewer-container']}>
            <KeyPageActions isInAddMode={isInAddMode}
              isReadonly={isReadonly} />

            <div className={style['key-header']}>

              {keyDef.modificationData ?
                <KeyModificationDetails className={style['modification-data']} {...keyDef.modificationData} />
                : null
              }

              <div className={style['display-name-wrapper']}>
                {isInAddMode ?
                  <NewKeyInput onKeyNameChanged={(name) => this._onKeyNameChanged(name)} />
                  :
                  <EditableText onTextChanged={(text) => this:: this._onDisplayNameChanged(text) }
                  placeHolder="Enter key display name"
              maxLength={80}
                value={meta.displayName}
                isReadonly={isReadonly}
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
                  <label className={style['actual-path']}>{key}</label>
                </div>
                : null}

              <div className={style['key-description-and-tags-wrapper']}>

                <div className={style['key-description-wrapper']}>
                  <EditableTextArea value={meta.description}
                    onTextChanged={(text) => this._onDescriptionChanged(text)}
                    placeHolder="Write key description"
                    title="Click to edit description"
                    classNames={{
                      input: style['description-input'],
                    }}
                    maxLength={400}
                    />
                </div>

                <div className={style['tags-wrapper']}>

                  <KeyTags onTagsChanged={(newTags) => this._onTagsChanged(newTags)}
                    tags={meta.tags}
                    />

                </div>

              </div>

            </div>

            <KeyRulesEditor keyDef={keyDef}
              sourceTree={JSON.parse(keyDef.source)}
              onMutation={x => this.props.updateKeyDef({ source: JSON.stringify(x, null, 4) })}
              className={style['key-rules-editor']}
              />

          </div>

        </fieldset>
      </form>
    );
  }
}

const getKeyPrefix = (path) => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys }))
)(({ keysList, onKeyNameChanged }) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));

  return (
    <div className={style['auto-suggest-wrapper']}>
      <ComboBox
        options={suggestions}
        placeholder="Enter key full path"
        onInputChange={text => onKeyNameChanged(text)}
        showValueInOptions
        />
    </div>
  );
});