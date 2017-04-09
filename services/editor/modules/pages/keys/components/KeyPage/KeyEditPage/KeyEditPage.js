import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import KeyRulesEditor from './KeyRulesEditor/KeyRulesEditor';
import style from './KeyEditPage.css';
import KeyTags from './KeyTags/KeyTags';
import EditableText from './EditableText/EditableText';
import EditableTextArea from './EditableTextArea/EditableTextArea';
import RevisionHistory from './RevisionHistory';
import { compose, pure } from 'recompose';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import R from 'ramda';
import alertIconSrc from './resources/alert-icon.svg';
import classNames from 'classnames';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import ReactTooltip from 'react-tooltip';
import * as RulesService from '../../../../../services/rules-service';

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

  _onMutation = (x) => this.props.updateKeyDef({ source: JSON.stringify(x, null, 4) });

  render() {
    const { selectedKey, isInAddMode, isInStickyMode, alerter, revision } = this.props;
    const { key, local: { meta, keyDef } } = selectedKey;
    const isReadonly = (!!meta.readOnly && meta.readOnly) //|| (revision && keyDef.revisionHistory[0] !== revision);

    const commonHeadersProps = {
      onKeyNameChanged: this::this._onKeyNameChanged,
      onDisplayNameChanged: this::this._onDisplayNameChanged,
      isInAddMode,
      isReadonly,
      keyMeta: meta,  
    };

    return (
      <div id="key-viewer-container-form" className={style['key-viewer-container-form']}>
        <fieldset className={style['key-viewer-container-fieldset']}
          disabled={isReadonly}>

          <div className={style['key-viewer-container']}>
            {isInStickyMode ?
              <KeyStickyHeader {...commonHeadersProps} />
              : null}
            <KeyFullHeader
              {...commonHeadersProps}
              onDescriptionChanged={text => this._onDescriptionChanged(text)}
              onTagsChanged={newTags => this._onTagsChanged(newTags)}
              revisionHistory={keyDef.revisionHistory}
              revision={revision}
              keyFullPath={key}
              isInStickyMode={isInStickyMode} />

            <KeyRulesEditor
              {...{ keyDef, alerter }}
              sourceTree={RulesService.convertToExplicitKey(JSON.parse(keyDef.source))}
              onMutation={this._onMutation}
              className={classNames(style['key-rules-editor'], { [style['sticky']]: isInStickyMode })} />

          </div>

        </fieldset>
      </div>
    );
  }
}

export default compose(
  stickyHeaderIdentifier('key-viewer-container-form', 150),
  pure
)(KeyEditPage);

const KeyStickyHeader = (props) => {
  const { isInAddMode, isReadonly } = props;

  return (
    <div className={style['sticky-key-header']}>

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
  const { isInAddMode, isReadonly, revisionHistory, keyMeta, onDescriptionChanged, onTagsChanged, keyFullPath,revision } = props;
  return (
    <div className={style['key-header']}>

      <KeyPageActions isInAddMode={isInAddMode} isReadonly={isReadonly} isInStickyMode={false} />

      <div className={style['key-meta-container']}>

        <div className={style['key-header-and-modification-wrapper']}>

          <HeaderMainInput {...props} />

          {revisionHistory ?
            <RevisionHistory revision={revision} revisionHistory={revisionHistory}/>
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
  const { isInAddMode, onKeyNameChanged, onDisplayNameChanged, keyMeta, isReadonly } = props;
  return (
    <div className={style['key-main-input']}>
      {isInAddMode ?
        <div className={style['new-key-input-wrapper']}>
          <NewKeyInput onKeyNameChanged={name => onKeyNameChanged(name)} />
          <div className={style['vertical-separator']}></div>
          <KeyValueTypeSelector />
        </div>
        :
        <EditableText
          onTextChanged={text => onDisplayNameChanged(text)}
          placeHolder="Enter key display name" maxLength={80} value={keyMeta.displayName} isReadonly={isReadonly}
          classNames={{
            container: style['display-name-container'],
            input: style['display-name-input'],
            text: style['display-name-text'],
            form: style['display-name-form']
          }}
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
  connect(state => ({ keysList: state.keys, keyNameValidation: state.selectedKey.validation.key }))
)(({
  keysList,
  keyNameValidation,
  onKeyNameChanged
}) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));
  return (
    <div className={style['auto-suggest-wrapper']}
      data-with-error={keyNameValidation.isShowingHint}>
      <div className={style['validation-icon-wrapper']}
        data-is-shown={keyNameValidation.isShowingHint}>
        <img
          className={style['validation-icon']}
          data-tip={keyNameValidation.hint}
          src={alertIconSrc} />
      </div>
      <ComboBox
        options={suggestions}
        placeholder="Enter key full path"
        onInputChange={text => onKeyNameChanged(text)}
        showValueInOptions
        className={style['auto-suggest']}
      />
      <ReactTooltip
        disable={!keyNameValidation.isShowingHint}
        effect="solid"
        place="top"
        delayHide={500} />
    </div>
  );
});