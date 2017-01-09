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
import { compose, pure } from 'recompose';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import R from 'ramda';
import ReactTooltip from 'react-tooltip';
import alertIconSrc from './resources/alert-icon.svg';
import classNames from 'classnames';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';

class KeyEditPage extends Component {

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

  _onMutation = (x) => this.props.updateKeyDef({ source: JSON.stringify(x, null, 4) })

  render() {
    const { selectedKey, isInAddMode, isInStickyMode } = this.props;
    const { key, local: {meta, keyDef}} = selectedKey;
    const isReadonly = !!meta.readOnly && meta.readOnly;

    const commonHeadersProps = {
      onKeyNameChanged: this::this._onKeyNameChanged,
      onDisplayNameChanged: this::this._onDisplayNameChanged,
      isInAddMode,
      isReadonly,
      keyMeta: meta,
    };

    return (
      <form id="key-viewer-container-form" className={style['key-viewer-container-form']}
        onSubmit={e => e.preventDefault()}>
        <fieldset className={style['key-viewer-container-fieldset']}
          disabled={isReadonly}>

          <div className={style['key-viewer-container']}>

            {isInStickyMode ?
              <KeyStickyHeader {...commonHeadersProps} />
              :
              <KeyFullHeader
                {...commonHeadersProps}
                onDescriptionChanged={text => this._onDescriptionChanged(text)}
                onTagsChanged={newTags => this._onTagsChanged(newTags)}
                modificationData={keyDef.modificationData}
                keyFullPath={key}
                isInStickyMode={isInStickyMode} />
            }

            <KeyRulesEditor
              keyDef={keyDef}
              sourceTree={JSON.parse(keyDef.source)}
              onMutation={this._onMutation}
              className={classNames(style['key-rules-editor'], { [style['sticky']]: isInStickyMode })} />

          </div>

        </fieldset>
      </form>
    );
  }
}

export default compose(
  stickyHeaderIdentifier('key-viewer-container-form', 150),
  pure
)(KeyEditPage);

const KeyStickyHeader = (props) => {
  const {isInAddMode, isReadonly} = props;

  return (
    <div className={style['sticky-key-header']} >

      <HeaderMainInput {...props} />

      {!isReadonly ?
        <div className={style['sticky-key-page-action-wrapper']}>
          <KeyPageActions isInAddMode={isInAddMode} isReadonly={isReadonly} isInStickyMode={true} />
        </div> :
        null}

    </div>
  );
};

const KeyFullHeader = (props) => {
  const {isInAddMode, isReadonly, modificationData, keyMeta, onDescriptionChanged, onTagsChanged, keyFullPath} = props;

  return (
    <div className={style['key-header']} >

      <KeyPageActions isInAddMode={isInAddMode} isReadonly={isReadonly} isInStickyMode={false} />

      <div className={style['key-meta-container']}>

        <div className={style['key-header-and-modification-wrapper']}>

          <HeaderMainInput {...props} />

          {modificationData ?
            <KeyModificationDetails className={style['modification-data']} {...modificationData} />
            : null
          }

        </div>

        {!isInAddMode ? <div className={style['key-full-path']}>
          <label>Full path: </label>
          <label className={style['actual-path']}>{keyFullPath}</label>
        </div> : null}

        <div className={style['key-description-and-tags-wrapper']}>
          <div className={style['key-description-wrapper']}>
            <EditableTextArea
              value={keyMeta.description}
              onTextChanged={text => onDescriptionChanged(text)}
              placeHolder="Write key description"
              title="Click to edit description"
              classNames={{ input: style['description-input'] }}
              maxLength={400}
              />
          </div>

          <div className={style['tags-wrapper']}>
            <KeyTags onTagsChanged={newTags => onTagsChanged(newTags)}
              tags={keyMeta.tags} />
          </div>
        </div>

      </div>

    </div>
  );
};

const HeaderMainInput = (props) => {
  const {isInAddMode, onKeyNameChanged, onDisplayNameChanged, keyMeta, isReadonly } = props;
  return (
    <div className={style['key-main-input']}>
      {isInAddMode ?
        <NewKeyInput onKeyNameChanged={name => onKeyNameChanged(name)} />
        :
        <EditableText
          onTextChanged={text => onDisplayNameChanged(text)}
          placeHolder="Enter key display name" maxLength={80} value={keyMeta.displayName} isReadonly={isReadonly}
          classNames={{ container: style['display-name-container'], input: style['display-name-input'], text: style['display-name-text'], form: style['display-name-form'] }}
          />}
    </div>
  );
};

const getKeyPrefix = (path) => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys, keyNameValidation: state.selectedKey.validation }))
)(({keysList,
  keyNameValidation,
  onKeyNameChanged }) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));

  const isShowingValidationMessage = keyNameValidation &&
    keyNameValidation.key &&
    !keyNameValidation.key.isValid &&
    !!keyNameValidation.key.hint;

  const keyValidationHint = isShowingValidationMessage ? keyNameValidation.key.hint : '';

  return (
    <div className={style['auto-suggest-wrapper']}
      data-with-error={isShowingValidationMessage}>
      <div className={style['validation-icon-wrapper']}
        data-is-shown={isShowingValidationMessage}>
        <img data-tip={keyValidationHint}
          className={style['validation-icon']}
          src={alertIconSrc}></img>
      </div>
      <ComboBox
        options={suggestions}
        placeholder="Enter key full path"
        onInputChange={text => onKeyNameChanged(text)}
        showValueInOptions
        className={style['auto-suggest']}
        />
      <ReactTooltip delayHide={1000}
        disable={!isShowingValidationMessage}
        effect='solid'
        place="top"
        delayHide={500} />
    </div>
  );
});